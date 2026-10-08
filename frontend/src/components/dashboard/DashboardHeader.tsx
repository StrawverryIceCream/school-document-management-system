import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { RefreshCw } from "lucide-react";

function DashboardHeader() {
  const { refreshDashboard, loading } = useDashboard();

  return (
    <div className="mb-8 flex items-start justify-between gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Overview of document requests and system activity
        </p>
      </div>
      <Button variant="outline" onClick={refreshDashboard} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}

export default DashboardHeader;