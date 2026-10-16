import { useMemo } from "react";
import { BadgeCheck, Folder, Hourglass, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useWindowView } from "@/hooks/useWindowView";
import { ICON_BOX_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";

export function WindowRequestSummary() {
  const { departmentRequests } = useWindowView();
  const averageTurnaround = useMemo(() => {
    const durations = departmentRequests
      .flatMap((request) => {
        if (request.status !== "claimed" || !request.claimedAt) return [];
        const startedAt = new Date(request.createdAt).getTime();
        const completedAt = new Date(request.claimedAt).getTime();
        return [(completedAt - startedAt) / (1000 * 60 * 60 * 24)];
      })
      .filter((days) => Number.isFinite(days) && days >= 0);

    return durations.length > 0
      ? (
          durations.reduce((total, days) => total + days, 0) / durations.length
        ).toFixed(1)
      : "—";
  }, [departmentRequests]);

  const pendingCount = departmentRequests.filter(
    (request) => request.status === "pending",
  ).length;
  const readyCount = departmentRequests.filter(
    (request) => request.status === "ready",
  ).length;

  return (
    <section
      aria-label="Request queue summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      <Card className="min-h-26 rounded-2xl border-0 bg-card py-0 shadow-sm">
        <CardContent className="flex min-h-26 flex-col justify-between p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Total Requests
            </p>
            <span className={cn(ICON_BOX_BASE, "size-7", TONES.neutral.icon)} aria-hidden="true">
              <Folder className="size-4" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className={cn(VALUE_BASE, "text-4xl")}>{departmentRequests.length}</p>
            <p className="pb-1 text-sm font-medium text-muted-foreground">Active in queue</p>
          </div>
        </CardContent>
      </Card>
      <Card className="min-h-26 rounded-2xl border-0 bg-card py-0 shadow-sm">
        <CardContent className="flex min-h-26 flex-col justify-between p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Pending Review
            </p>
            <span className={cn(ICON_BOX_BASE, "size-7", TONES.amber.icon)} aria-hidden="true">
              <Hourglass className="size-4" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className={cn(VALUE_BASE, "text-4xl", TONES.amber.value)}>{pendingCount}</p>
            <p className="pb-1 text-sm font-medium text-muted-foreground">Awaiting evaluation</p>
          </div>
        </CardContent>
      </Card>
      <Card className="min-h-26 rounded-2xl border-0 bg-card py-0 shadow-sm">
        <CardContent className="flex min-h-26 flex-col justify-between p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ready for Release
            </p>
            <span className={cn(ICON_BOX_BASE, "size-7", TONES.emerald.icon)} aria-hidden="true">
              <BadgeCheck className="size-4" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className={cn(VALUE_BASE, "text-4xl", TONES.emerald.value)}>{readyCount}</p>
            <p className="pb-1 text-sm font-medium text-muted-foreground">Cleared pickups</p>
          </div>
        </CardContent>
      </Card>
      <Card className="min-h-26 rounded-2xl border-0 bg-card py-0 shadow-sm">
        <CardContent className="flex min-h-26 flex-col justify-between p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Avg Turnaround
            </p>
            <span className={cn(ICON_BOX_BASE, "size-7", TONES.neutral.icon)} aria-hidden="true">
              <Timer className="size-4 text-destructive" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className={cn(VALUE_BASE, "text-4xl")}>
              {averageTurnaround}
              {averageTurnaround !== "—" && (
                <span className="ml-1 text-base font-medium text-muted-foreground">d</span>
              )}
            </p>
            <p className="pb-1 text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Target &lt; 3.0d
            </p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
