import { useDashboard } from "@/hooks/useDashboard";
import {
  Clock,
  Printer,
  PackageCheck,
  AlertTriangle,
  Wallet,
  Files,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";

export default function StatsOverview() {
  const { stats, requests, loading, error } = useDashboard();

  if (error) return null;

  const overdueCount = stats?.slaWarning ?? 0;
  const revenueDisplay =
    (stats?.totalRevenue ?? 0) >= 10000
      ? `₱${((stats?.totalRevenue ?? 0) / 1000).toFixed(1)}k`
      : `₱${(stats?.totalRevenue ?? 0).toLocaleString()}`;

  const kpis = [
    {
      id: "totalVolume",
      label: "Total Volume",
      value: requests.length,
      icon: Files,
      tone: "brand" as const,
      topBarColor: "bg-primary",
      tag: {
        label: `${stats?.efficiencyRate ?? 100}% Rate`,
        tone: "emerald" as const,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      caption: `${stats?.claimed ?? 0} completed / ${stats?.pending ?? 0} pending`,
    },
    {
      id: "immediateBacklog",
      label: "Immediate Backlog",
      value: stats?.immediateBacklog ?? 0,
      icon: Clock,
      tone: "amber" as const,
      topBarColor: "bg-amber-500",
      tag: {
        label: "Action Needed",
        tone: "amber" as const,
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      },
      caption: `${stats?.pending ?? 0} pending review`,
    },
    {
      id: "inProduction",
      label: "In Production",
      value: stats?.inProduction ?? 0,
      icon: Printer,
      tone: "brand" as const,
      topBarColor: "bg-sky-500",
      tag: {
        label: "Processing",
        tone: "brand" as const,
        className: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
      },
      caption: "Dry seal & officer signoff",
    },
    {
      id: "readyForRelease",
      label: "Ready for Release",
      value: stats?.readyForRelease ?? 0,
      icon: PackageCheck,
      tone: "emerald" as const,
      topBarColor: "bg-emerald-500",
      tag: {
        label: "For Pickup",
        tone: "emerald" as const,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      caption: "Counter & office release",
    },
    {
      id: "slaWarning",
      label: "SLA At-Risk",
      value: overdueCount,
      valueClassName:
        overdueCount > 0 ? "text-rose-600 dark:text-rose-400" : undefined,
      icon: AlertTriangle,
      tone: "red" as const,
      topBarColor: "bg-rose-500",
      tag: {
        label: overdueCount > 0 ? "Delayed" : "On Track",
        tone: (overdueCount > 0 ? "red" : "emerald") as const,
        className:
          overdueCount > 0
            ? "bg-rose-500/10 text-rose-700 dark:text-rose-400"
            : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      caption:
        overdueCount > 0
          ? `${overdueCount} cases past turnaround`
          : `Avg turnaround: ${stats?.avgTurnaroundDays ?? 1.6}d`,
    },
    {
      id: "documentRevenue",
      label: "Settled Revenue",
      value: revenueDisplay,
      icon: Wallet,
      tone: "emerald" as const,
      topBarColor: "bg-emerald-600",
      tag: {
        label: `${stats?.settledTransactions ?? 0} Paid`,
        tone: "emerald" as const,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      caption: `${stats?.settledTransactions ?? 0} verified payments`,
    },
  ];

  return (
    <section
      aria-label="Executive KPI Overview"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
    >
      {kpis.map((kpi) => (
        <StatCard
          key={kpi.id}
          label={kpi.label}
          value={kpi.value}
          valueClassName={kpi.valueClassName}
          icon={kpi.icon}
          tone={kpi.tone}
          topBarColor={kpi.topBarColor}
          tag={kpi.tag}
          caption={kpi.caption}
          loading={loading}
          compact
        />
      ))}
    </section>
  );
}


