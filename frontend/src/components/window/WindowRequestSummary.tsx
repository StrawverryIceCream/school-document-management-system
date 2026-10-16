import { useMemo } from "react";
import { BadgeCheck, Folder, Hourglass, Timer } from "lucide-react";
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

  const summaryCards = [
    {
      label: "Total Requests",
      value: departmentRequests.length,
      icon: Folder,
      tone: TONES.neutral,
      description: "Active in queue",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: Hourglass,
      tone: TONES.amber,
      description: "Awaiting evaluation",
    },
    {
      label: "Ready for Release",
      value: readyCount,
      icon: BadgeCheck,
      tone: TONES.emerald,
      description: "Cleared pickups",
    },
    {
      label: "Avg Turnaround",
      value: averageTurnaround,
      icon: Timer,
      tone: TONES.red,
      description: "Target < 3.0d",
    },
  ];

  return (
    <section
      aria-label="Request queue summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {summaryCards.map(({ label, value, icon: Icon, tone, description }) => (
        <div
          key={label}
          className="relative h-28 rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div
            className={cn(
              ICON_BOX_BASE,
              "absolute right-3 top-3 size-8",
              tone.icon,
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex h-full flex-col justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <div className="flex items-end justify-between gap-2">
              <p className={cn(VALUE_BASE, "text-4xl", tone.value)}>
                {value}
                {label === "Avg Turnaround" && value !== "—" && (
                  <span className="ml-1 text-base font-medium text-muted-foreground">
                    d
                  </span>
                )}
              </p>
              <p
                className={cn(
                  "pb-1 text-right text-sm font-medium",
                  label === "Avg Turnaround"
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-muted-foreground",
                )}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
