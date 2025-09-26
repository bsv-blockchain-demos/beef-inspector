import { useState } from "react";
import { TransactionInput } from "@/components/TransactionInput";
import { ValidationResult } from "@/components/ValidationResult";
import { TransactionDetails } from "@/components/TransactionDetails";
import { ScriptDebugger } from "@/components/ScriptDebugger";
import { useToast } from "@/hooks/use-toast";

// BSV SDK imports
import { Transaction, Utils, Spend } from "@bsv/sdk";

interface AnalysisResult {
  isValid: boolean;
  txid?: string;
  error?: string;
  beefLog?: string;
  txDetails?: {
    version: number;
    inputs: number;
    outputs: number;
    lockTime: number;
    size: number;
  };
  scriptErrors?: Array<{
    inputIndex: number;
    scriptType: 'unlocking' | 'locking';
    asm: string;
    error: string;
    executionPoint?: number;
  }>;
}

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const analyzeTransaction = async (hexString: string) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Parse the BEEF hex string
      const beefBytes = Utils.toArray(hexString, 'hex');
      const tx = Transaction.fromBEEF(beefBytes);
      
      // Get basic transaction details
      const txDetails = {
        version: tx.version,
        inputs: tx.inputs.length,
        outputs: tx.outputs.length,
        lockTime: tx.lockTime,
        size: tx.toBinary().length
      };

      // Try to verify the transaction
      let isValid = false;
      let error: string | undefined;
      let beefLog: string | undefined;
      let scriptErrors: AnalysisResult['scriptErrors'] = [];

      try {
        await tx.verify();
        isValid = true;
        toast({
          title: "Transaction Valid",
          description: "The transaction passes all validation checks.",
        });
      } catch (validationError: any) {
        isValid = false;
        error = validationError.message || "Unknown validation error";

        // Generate BEEF log for debugging
        try {
          const beefBytes = tx.toBEEF();
          beefLog = "BEEF binary data length: " + beefBytes.length + " bytes\n";
          beefLog += "Transaction structure:\n";
          beefLog += "- Version: " + tx.version + "\n";
          beefLog += "- Inputs: " + tx.inputs.length + "\n";
          beefLog += "- Outputs: " + tx.outputs.length + "\n";
          beefLog += "- LockTime: " + tx.lockTime + "\n";
          
          // Add detailed input/output info
          tx.inputs.forEach((input, i) => {
            beefLog += `\nInput ${i}:\n`;
            beefLog += `  - SourceTXID: ${input.sourceTXID || 'N/A'}\n`;
            beefLog += `  - SourceOutputIndex: ${input.sourceOutputIndex || 'N/A'}\n`;
            beefLog += `  - UnlockingScript: ${input.unlockingScript?.toASM() || 'N/A'}\n`;
          });
          
          tx.outputs.forEach((output, i) => {
            beefLog += `\nOutput ${i}:\n`;
            beefLog += `  - Satoshis: ${output.satoshis}\n`;
            beefLog += `  - LockingScript: ${output.lockingScript.toASM()}\n`;
          });
        } catch (beefError) {
          console.warn("Could not generate BEEF log:", beefError);
        }

        // Analyze script execution errors
        try {
          for (let i = 0; i < tx.inputs.length; i++) {
            try {
              const input = tx.inputs[i];
              if (input.sourceTransaction && input.sourceOutputIndex !== undefined) {
                const sourceOutput = input.sourceTransaction.outputs[input.sourceOutputIndex];
                
                // Create a Spend object to analyze script execution
                const spend = new Spend({
                  sourceTXID: input.sourceTransaction.id('hex'),
                  sourceOutputIndex: input.sourceOutputIndex,
                  sourceSatoshis: sourceOutput.satoshis,
                  lockingScript: sourceOutput.lockingScript,
                  transactionVersion: tx.version,
                  otherInputs: tx.inputs.filter((_, idx) => idx !== i),
                  outputs: tx.outputs,
                  inputIndex: i,
                  inputSequence: input.sequence,
                  lockTime: tx.lockTime,
                  unlockingScript: input.unlockingScript
                });

                // Try to validate this specific input
                try {
                  spend.validate();
                } catch (spendError: any) {
                  // Add both unlocking and locking script information for failed inputs
                  scriptErrors.push({
                    inputIndex: i,
                    scriptType: 'unlocking',
                    asm: input.unlockingScript?.toASM() || "N/A",
                    error: spendError.message || "Script execution failed",
                    executionPoint: undefined
                  });
                  scriptErrors.push({
                    inputIndex: i,
                    scriptType: 'locking',
                    asm: sourceOutput.lockingScript.toASM(),
                    error: spendError.message || "Script execution failed",
                    executionPoint: undefined
                  });
                }
              }
            } catch (inputError: any) {
              scriptErrors.push({
                inputIndex: i,
                scriptType: 'unlocking',
                asm: tx.inputs[i].unlockingScript?.toASM() || "N/A",
                error: inputError.message || "Input validation failed",
                executionPoint: undefined
              });
            }
          }
        } catch (scriptAnalysisError) {
          console.warn("Could not analyze script errors:", scriptAnalysisError);
        }

        toast({
          title: "Transaction Invalid",
          description: "The transaction failed validation. Check the details below.",
          variant: "destructive",
        });
      }

      setAnalysisResult({
        isValid,
        txid: tx.id('hex'),
        error,
        beefLog,
        txDetails,
        scriptErrors
      });

    } catch (parseError: any) {
      const errorMessage = parseError.message || "Failed to parse transaction";
      setAnalysisResult({
        isValid: false,
        error: `Parse Error: ${errorMessage}`
      });
      
      toast({
        title: "Parse Error",
        description: "Could not parse the provided hex string as a BEEF transaction.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">BSV Transaction Debugger</h1>
          <p className="text-muted-foreground">
            Analyze and debug Bitcoin SV transactions in BEEF format
          </p>
        </div>

        <TransactionInput onAnalyze={analyzeTransaction} isLoading={isLoading} />

        {analysisResult && (
          <div className="space-y-6">
            <ValidationResult
              isValid={analysisResult.isValid}
              txid={analysisResult.txid}
              error={analysisResult.error}
            />

            <TransactionDetails
              beefLog={analysisResult.beefLog}
              txDetails={analysisResult.txDetails}
            />

            <ScriptDebugger scriptErrors={analysisResult.scriptErrors} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;