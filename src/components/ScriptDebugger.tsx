import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, Code, Target } from "lucide-react";

// Sighash type constants
const SIGHASH_ALL = 0x01;
const SIGHASH_NONE = 0x02;
const SIGHASH_SINGLE = 0x03;
const SIGHASH_FORKID = 0x40;
const SIGHASH_ANYONECANPAY = 0x80;

interface ScriptError {
  inputIndex: number;
  scriptType: 'unlocking' | 'locking';
  asm: string;
  error: string;
  executionPoint?: number;
}

interface ScriptDebuggerProps {
  scriptErrors?: ScriptError[];
}

export const ScriptDebugger = ({ scriptErrors }: ScriptDebuggerProps) => {
  if (!scriptErrors || scriptErrors.length === 0) {
    return null;
  }

  // Group script errors by input index
  const errorsByInput = scriptErrors.reduce((acc, error) => {
    if (!acc[error.inputIndex]) {
      acc[error.inputIndex] = [];
    }
    acc[error.inputIndex].push(error);
    return acc;
  }, {} as Record<number, ScriptError[]>);

  const getSighashTypeName = (sighashByte: number): string[] => {
    const types: string[] = [];
    
    const baseType = sighashByte & 0x1F; // Remove FORKID and ANYONECANPAY flags
    switch (baseType) {
      case SIGHASH_ALL:
        types.push('SIGHASH_ALL');
        break;
      case SIGHASH_NONE:
        types.push('SIGHASH_NONE');
        break;
      case SIGHASH_SINGLE:
        types.push('SIGHASH_SINGLE');
        break;
      default:
        types.push(`SIGHASH_${baseType}`);
    }
    
    if (sighashByte & SIGHASH_FORKID) {
      types.push('SIGHASH_FORKID');
    }
    if (sighashByte & SIGHASH_ANYONECANPAY) {
      types.push('SIGHASH_ANYONECANPAY');
    }
    
    return types;
  };

  const isSignature = (opcode: string): boolean => {
    // Signatures are typically hex strings of specific lengths (70-72 bytes for DER + sighash)
    return /^[0-9a-fA-F]{140,144}$/.test(opcode);
  };

  const renderAsmWithSighashTooltips = (asm: string, executionPoint?: number) => {
    const opcodes = asm.split(' ');
    
    return opcodes.map((opcode, index) => {
      const isExecPoint = index === executionPoint;
      const baseClasses = isExecPoint ? "bg-destructive/20 text-destructive px-1 rounded" : "";
      
      if (isSignature(opcode)) {
        // Extract the last byte (sighash type)
        const sighashByte = parseInt(opcode.slice(-2), 16);
        const sighashTypes = getSighashTypeName(sighashByte);
        
        return (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <span className={`${baseClasses} cursor-help underline decoration-dotted`}>
                {opcode}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-semibold">Signature Hash Types:</div>
                {sighashTypes.map((type, typeIndex) => (
                  <div key={typeIndex} className="text-xs">
                    <Badge variant="secondary" className="text-xs">{type}</Badge>
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        );
      }
      
      return (
        <span key={index} className={baseClasses}>
          {opcode}
        </span>
      );
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5 text-warning" />
            Script Execution Errors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(errorsByInput).map(([inputIndex, errors], groupIndex) => (
            <div key={inputIndex} className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <Badge variant="destructive">Input {inputIndex}</Badge>
              </div>
              
              {/* Sort to show unlocking script first, then locking script */}
              {errors
                .sort((a, b) => a.scriptType === 'unlocking' ? -1 : 1)
                .map((error, errorIndex) => (
                  <div key={errorIndex} className="space-y-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <Badge variant="outline">{error.scriptType} script</Badge>
                        Script ASM
                      </div>
                      <ScrollArea className="h-[120px]">
                        <div className="code-block text-xs break-words whitespace-normal">
                          {renderAsmWithSighashTooltips(error.asm, error.executionPoint).map((element, elemIndex) => (
                            <span key={elemIndex}>
                              {element}
                              {elemIndex < renderAsmWithSighashTooltips(error.asm, error.executionPoint).length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {errorIndex === 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-destructive">Error Details</div>
                        <div className="code-block text-destructive bg-destructive/10 border-destructive/20 text-xs break-words">
                          {error.error}
                        </div>
                      </div>
                    )}

                    {error.executionPoint !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        Execution failed at opcode position: {error.executionPoint}
                      </div>
                    )}
                  </div>
                ))}

              {groupIndex < Object.keys(errorsByInput).length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};