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
import StatCard from "@/components/shared/StatCard";

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
      icon: Clock,
      tone: "amber" as const,
      topBarColor: "bg-amber-500",
      tag: {
        label: "Action Needed",
        tone: "amber" as const,
        className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
      },
      caption: `${urgentCount} urgent / pending review`,
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
      caption: "Dry seal & registrar signoff",
    },
    {
      id: "readyForRelease",
      label: "Ready for Release",
      value: stats?.readyForRelease ?? 0,
      icon: PackageCheck,
      tone: "emerald" as const,
      topBarColor: "bg-emerald-500",
      tag: {
        label: "Available",
        tone: "emerald" as const,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      caption: "Windows 1 to 6 pickup counters",
    },
    {
      id: "slaWarning",
      label: "SLA Warning",
      value: overdueCount,
      valueClassName: overdueCount > 0 ? "text-rose-600 dark:text-rose-400" : undefined,
      icon: AlertTriangle,
      tone: "red" as const,
      topBarColor: "bg-rose-500",
      tag: {
        label: ">3d Late",
        tone: "red" as const,
        className: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
      },
      caption: overdueCount > 0 ? `${overdueCount} cases past turnaround` : "Turnaround within standard",
    },
    {
      id: "documentRevenue",
      label: "Document Revenue",
      value: revenueDisplay,
      icon: Wallet,
      tone: "amber" as const,
      topBarColor: "bg-orange-500",
      tag: {
        label: "+14.8%",
        icon: TrendingUp,
        tone: "emerald" as const,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      caption: `${stats?.settledTransactions ?? 0} settled transactions`,
    },
    {
      id: "efficiencyRate",
      label: "Efficiency Rate",
      value: `${stats?.efficiencyRate ?? 100}%`,
      icon: Gauge,
      tone: "brand" as const,
      topBarColor: "bg-primary",
      tag: {
        label: "Target 95%",
        tone: "emerald" as const,
        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
      },
      caption: `Avg. turnaround: ${stats?.avgTurnaroundDays ?? 1.6}d`,
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


