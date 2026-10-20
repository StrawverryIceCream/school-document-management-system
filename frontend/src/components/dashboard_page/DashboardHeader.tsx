import { RefreshCw, Radio, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardHeader() {
  const { refreshDashboard, loading, timeRange, setTimeRange } = useDashboard();
  const { user } = useAuth();

  const title = user?.role === "staff" ? "Staff Dashboard" : "Admin Dashboard";

  return (
    <header className="flex flex-col gap-6 pb-2 border-b border-border/40 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>Active Academic Term AY 2026–2027</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/80 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <Radio className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span>Real-Time Registry Feed</span>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Overview of document processing velocity, counter window queues, and institutional revenue collections.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
        <div className="relative inline-flex items-center">
          <Calendar className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-10 appearance-none rounded-xl border border-border/70 bg-card pl-9 pr-8 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            aria-label="Filter time range"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="sem">This Semester</option>
          </select>
        </div>

        <Button
          variant="outline"
          className="h-10 rounded-xl px-4 text-sm font-medium shadow-sm hover:bg-muted/60"
          onClick={refreshDashboard}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </header>
  );
}