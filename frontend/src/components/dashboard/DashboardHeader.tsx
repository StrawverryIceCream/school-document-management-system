import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { RefreshCw } from "lucide-react";

function DashboardHeader() {
  const { refreshDashboard, loading } = useDashboard();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of document requests and system activity
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={refreshDashboard} disabled={loading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
        Refresh
      </Button>
    </div>
  );
}

export default DashboardHeader;