import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

interface TransactionInputProps {
  onAnalyze: (hexString: string) => void;
  isLoading: boolean;
}

export const TransactionInput = ({ onAnalyze, isLoading }: TransactionInputProps) => {
  const [hexString, setHexString] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hexString.trim()) {
      onAnalyze(hexString.trim());
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          BSV Transaction Debugger
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hex-input">Transaction Hex (BEEF Format)</Label>
            <Textarea
              id="hex-input"
              placeholder="Enter your transaction hex string in BEEF format..."
              value={hexString}
              onChange={(e) => setHexString(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
              disabled={isLoading}
            />
          </div>
          <Button 
            type="submit" 
            disabled={!hexString.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? "Analyzing..." : "Analyze Transaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};