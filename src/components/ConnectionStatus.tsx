import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useCMSV6Login } from "@/hooks/useCMSV6Data";

export const ConnectionStatus = () => {
  const { data, isLoading, error } = useCMSV6Login();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : error ? (
            <XCircle className="w-5 h-5 text-destructive" />
          ) : (
            <CheckCircle className="w-5 h-5 text-success" />
          )}
          <span className="font-medium">CMSV6 Connection</span>
        </div>
        <Badge variant={error ? "destructive" : "default"}>
          {isLoading ? "Connecting..." : error ? "Offline" : "Connected"}
        </Badge>
      </div>
      {data && (
        <div className="mt-2 text-xs text-muted-foreground">
          <pre className="bg-muted p-2 rounded overflow-auto max-h-20">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </Card>
  );
};
