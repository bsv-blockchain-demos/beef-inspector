import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Hash, Info } from "lucide-react";

interface TransactionDetailsProps {
  beefLog?: string;
  txDetails?: {
    version: number;
    inputs: number;
    outputs: number;
    lockTime: number;
    size: number;
  };
}

export const TransactionDetails = ({ beefLog, txDetails }: TransactionDetailsProps) => {
  return (
    <div className="space-y-4">
      {txDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-accent" />
              Transaction Info
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Version</div>
                <Badge variant="secondary">{txDetails.version}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Inputs</div>
                <Badge variant="secondary">{txDetails.inputs}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Outputs</div>
                <Badge variant="secondary">{txDetails.outputs}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Lock Time</div>
                <Badge variant="secondary">{txDetails.lockTime}</Badge>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Size</div>
                <Badge variant="secondary">{txDetails.size} bytes</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {beefLog && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              BEEF Structure Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <pre className="code-block text-xs whitespace-pre-wrap">
                {beefLog}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};