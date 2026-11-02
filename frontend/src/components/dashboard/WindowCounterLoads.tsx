import { Link } from "react-router-dom";
import { Building2, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { calculateOfficeCounterLoads } from "@/lib/dashboard/counter-loads";
import { cn } from "@/lib/utils";

export default function WindowCounterLoads() {
  const { requests } = useDashboard();

  const officeData = calculateOfficeCounterLoads(requests, 6);
  const totalInQueue = officeData.reduce((acc, w) => acc + w.count, 0);
  const maxLoad = Math.max(10, ...officeData.map((w) => w.count));

  return (
    <Card className="flex flex-col justify-between rounded-xl border border-border/60 bg-card shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          <CardTitle className="text-sm font-bold">Office Counter Loads</CardTitle>
        </div>
        <Badge
          variant="secondary"
          className="shrink-0 w-fit rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
        >
          {totalInQueue > 0 ? `${totalInQueue} Active in Queue` : "Offices Idle"}
        </Badge>
      </CardHeader>

      <CardContent className="flex flex-col gap-3.5 pt-4">
        {officeData.map((office) => {
          const percentage =
            office.count === 0
              ? 0
              : Math.min(Math.round((office.count / maxLoad) * 100), 100);

          const content = (
            <div className="flex flex-col gap-1.5 group/item">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-foreground group-hover/item:text-primary transition-colors">
                    {office.officeCode}
                  </span>
                  <span className="text-muted-foreground truncate max-w-40">
                    &bull; {office.officeName}
                  </span>
                  {office.routeUrl && (
                    <ArrowUpRight className="h-3 w-3 text-muted-foreground/60 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 pl-2">
                  {office.count} in queue &bull;{" "}
                  <span className={office.statusColor}>{office.statusText}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    office.barBg,
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );

          if (office.routeUrl) {
            return (
              <Link
                key={office.id}
                to={office.routeUrl}
                className="rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                title={`Open ${office.officeName} workspace`}
              >
                {content}
              </Link>
            );
          }

          return <div key={office.id}>{content}</div>;
        })}

        <div className="mt-2 border-t border-border/40 pt-3">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold"
          >
            <Link to="/requests">
              <span>View All Department Queues</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
