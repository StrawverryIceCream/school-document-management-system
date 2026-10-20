import { useDashboard } from "@/hooks/useDashboard";
import {
  Clock,
  Printer,
  PackageCheck,
  AlertTriangle,
  Wallet,
  Gauge,
  TrendingUp,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function StatsOverview() {
  const { stats, loading, error } = useDashboard();

  if (error) return null;

  const urgentCount = stats?.immediateBacklog ?? 0;
  const overdueCount = stats?.slaWarning ?? 0;
  const revenueDisplay =
    (stats?.totalRevenue ?? 0) >= 10000
      ? `₱${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}k`
      : `₱${(stats?.totalRevenue ?? 0).toLocaleString()}`;

  const kpis = [
    {
      id: "immediateBacklog",
      label: "Immediate Backlog",
      value: stats?.immediateBacklog ?? 0,
      badge: "Action Needed",
      badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      topBarColor: "bg-amber-500",
      icon: Clock,
      iconColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      subtext: `${urgentCount} urgent / pending review`,
    },
    {
      id: "inProduction",
      label: "In Production",
      value: stats?.inProduction ?? 0,
      badge: "Processing",
      badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
      topBarColor: "bg-sky-500",
      icon: Printer,
      iconColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      subtext: "Dry seal & registrar signoff",
    },
    {
      id: "readyForRelease",
      label: "Ready for Release",
      value: stats?.readyForRelease ?? 0,
      badge: "Available",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      topBarColor: "bg-emerald-500",
      icon: PackageCheck,
      iconColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      subtext: "Windows 1 to 6 pickup counters",
    },
    {
      id: "slaWarning",
      label: "SLA Warning",
      value: overdueCount,
      valueColor: overdueCount > 0 ? "text-rose-600 dark:text-rose-400" : undefined,
      badge: ">3d Late",
      badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
      topBarColor: "bg-rose-500",
      icon: AlertTriangle,
      iconColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
      subtext: overdueCount > 0 ? `${overdueCount} cases past turnaround` : "Turnaround within standard",
    },
    {
      id: "documentRevenue",
      label: "Document Revenue",
      value: revenueDisplay,
      badge: "+14.8%",
      badgeIcon: TrendingUp,
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      topBarColor: "bg-orange-500",
      icon: Wallet,
      iconColor: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
      subtext: `${stats?.settledTransactions ?? 0} settled transactions`,
    },
    {
      id: "efficiencyRate",
      label: "Efficiency Rate",
      value: `${stats?.efficiencyRate ?? 100}%`,
      badge: "Target 95%",
      badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      topBarColor: "bg-primary",
      icon: Gauge,
      iconColor: "bg-primary/10 text-primary",
      subtext: `Avg. turnaround: ${stats?.avgTurnaroundDays ?? 1.6}d`,
    },
  ];

  return (
    <section
      aria-label="Executive KPI Overview"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const BadgeIcon = kpi.badgeIcon;

        return (
          <div
            key={kpi.id}
            className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={cn(
                "absolute left-0 right-0 top-0 h-1 opacity-85",
                kpi.topBarColor,
              )}
            />
            <div className="mb-3 flex items-start justify-between gap-2 pt-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </span>
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  kpi.iconColor,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <span
                    className={cn(
                      "text-2xl font-bold tracking-tight text-foreground",
                      kpi.valueColor,
                    )}
                  >
                    {kpi.value}
                  </span>
                )}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    kpi.badgeColor,
                  )}
                >
                  {BadgeIcon && <BadgeIcon className="h-3 w-3" />}
                  {kpi.badge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{kpi.subtext}</p>
            </div>
          </div>
        );
      })}
    </section>
  );
}

