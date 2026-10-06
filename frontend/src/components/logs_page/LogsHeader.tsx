import { Button } from "@/components/ui/button";
import { useLogs } from "@/hooks/useLogs";
import { RefreshCw } from "lucide-react";

function LogsHeader() {
  const { refreshLogs, loading } = useLogs();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">
          Every recorded action across requests, payments, and accounts
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={refreshLogs} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}

export default LogsHeader;