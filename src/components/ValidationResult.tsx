import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ValidationResultProps {
  isValid: boolean;
  txid?: string;
  error?: string;
}

export const ValidationResult = ({ isValid, txid, error }: ValidationResultProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : (
            <XCircle className="h-5 w-5 text-destructive" />
          )}
          Validation Result
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant={isValid ? "default" : "destructive"}>
            {isValid ? "VALID" : "INVALID"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Transaction {isValid ? "passes" : "fails"} validation
          </span>
        </div>
        
        {txid && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Transaction ID</Label>
            <div className="code-block break-all">{txid}</div>
          </div>
        )}
        
        {error && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-destructive">Error</Label>
            <div className="code-block text-destructive bg-destructive/10 border-destructive/20">
              {error}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Add Label import
import { Label } from "@/components/ui/label";