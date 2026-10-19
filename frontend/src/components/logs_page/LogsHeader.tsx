import { RefreshCw } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useLogs } from "@/hooks/useLogs";

export default function LogsHeader() {
  const { refreshLogs, loading } = useLogs();

  return (
    <PageHeader
      title="Activity Logs"
      badge="Audit Trail"
      description="Every recorded action across requests, payments, and accounts"
    >
      <Button
        variant="outline"
        className="h-11 px-5 text-base"
        onClick={refreshLogs}
        disabled={loading}
      >
        <RefreshCw
          className={`size-4 mr-2 ${loading ? "animate-spin" : ""}`}
        />
        Refresh
      </Button>
    </PageHeader>
  );
}