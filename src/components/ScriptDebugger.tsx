import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Code, Target } from "lucide-react";

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

  const highlightExecutionPoint = (asm: string, executionPoint?: number) => {
    if (executionPoint === undefined) return asm;
    
    const opcodes = asm.split(' ');
    return opcodes.map((opcode, index) => {
      if (index === executionPoint) {
        return `<span class="bg-destructive/20 text-destructive px-1 rounded">${opcode}</span>`;
      }
      return opcode;
    }).join(' ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5 text-warning" />
          Script Execution Errors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scriptErrors.map((error, index) => (
          <div key={index} className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <Badge variant="destructive">Input {error.inputIndex}</Badge>
              <Badge variant="outline">{error.scriptType} script</Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Script ASM
              </div>
              <ScrollArea className="h-[120px]">
                <div 
                  className="code-block text-xs"
                  dangerouslySetInnerHTML={{
                    __html: highlightExecutionPoint(error.asm, error.executionPoint)
                  }}
                />
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium text-destructive">Error Details</div>
              <div className="code-block text-destructive bg-destructive/10 border-destructive/20 text-xs">
                {error.error}
              </div>
            </div>

            {error.executionPoint !== undefined && (
              <div className="text-xs text-muted-foreground">
                Execution failed at opcode position: {error.executionPoint}
              </div>
            )}

            {index < scriptErrors.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};