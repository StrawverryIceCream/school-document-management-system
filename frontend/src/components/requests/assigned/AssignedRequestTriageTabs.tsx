import { cn } from "@/lib/utils";
import type { TriageTab } from "@/lib/sectors/__tests__/assigned-request-route.test";

interface AssignedRequestTriageTabsProps {
  currentTab: TriageTab;
  onTabChange: (tab: TriageTab) => void;
  counts: Record<TriageTab, number>;
}

export default function AssignedRequestTriageTabs({
  currentTab,
  onTabChange,
  counts,
}: AssignedRequestTriageTabsProps) {
  const tabs: {
    key: TriageTab;
    label: string;
    count: number;
    badgeColor?: string;
  }[] = [
    { key: "all", label: "All Assigned", count: counts.all },
    {
      key: "action_needed",
      label: "Action Needed",
      count: counts.action_needed,
      badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    },
    {
      key: "in_production",
      label: "In Production",
      count: counts.in_production,
      badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
    },
    {
      key: "sla_risk",
      label: "SLA At-Risk",
      count: counts.sla_risk,
      badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
    },
    {
      key: "ready",
      label: "Ready for Pickup",
      count: counts.ready,
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border/50 pb-2.5">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[11px] font-semibold tabular-nums",
                isActive
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : (tab.badgeColor ?? "bg-muted text-muted-foreground"),
              )}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
