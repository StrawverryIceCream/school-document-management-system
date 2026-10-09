import { Button } from "@/components/ui/button";
import { useLogs } from "@/hooks/useLogs";
import { RefreshCw } from "lucide-react";

function LogsHeader() {
  const { refreshLogs, loading } = useLogs();

  return (
    <div className="flex items-start justify-between mb-8 gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Activity Logs</h1>
        <p className="text-sm mt-2">
          Every recorded action across requests, payments, and accounts
        </p>
      </div>
      <Button variant="outline" onClick={refreshLogs} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}

export default LogsHeader;