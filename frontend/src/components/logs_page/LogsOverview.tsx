import StatCard from "@/components/shared/StatCard";
import { useLogs } from "@/hooks/useLogs";
import { formatDate } from "@/lib/logs";
import type { Tone } from "@/lib/tones";
import { Activity, Clock, Users, type LucideIcon } from "lucide-react";

type LogCardConfig = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: Tone;
};

function LogsOverview() {
  const { stats, error } = useLogs();

  if (error) return null;

  const cards: LogCardConfig[] = [
    {
      label: "Total Logs",
      value: stats ? stats.total : "—",
      icon: Activity,
      tone: "neutral",
    },
    {
      label: "Active Accounts",
      value: stats ? stats.activeAccounts : "—",
      icon: Users,
      tone: "emerald",
    },
    {
      label: "Last Activity",
      value: stats?.lastActivityAt ? formatDate(stats.lastActivityAt) : "—",
      icon: Clock,
      tone: "brand",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
      {cards.map(({ label, value, icon, tone }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
        />
      ))}
    </div>
  );
}

export default LogsOverview;
