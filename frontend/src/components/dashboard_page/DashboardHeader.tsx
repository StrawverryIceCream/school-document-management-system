import { RefreshCw } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";

export default function DashboardHeader() {
  const { refreshDashboard, loading } = useDashboard();

  return (
    <PageHeader
      title="Admin Dashboard"
      badge="Realtime Analytics"
      description="Overview of document requests, window performance, and system activity"
    >
      <Button
        variant="outline"
        className="h-11 px-5 text-base"
        onClick={refreshDashboard}
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