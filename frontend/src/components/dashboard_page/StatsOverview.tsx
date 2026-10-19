import { useDashboard } from "@/hooks/useDashboard";
import {
  Ban,
  Clock,
  Loader,
  PackageCheck,
  type LucideIcon,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import type { Tone } from "@/lib/tones";

type CardConfig = {
  key: "pending" | "processing" | "ready" | "claimed" | "cancelled";
  label: string;
  icon: LucideIcon;
  tone: Tone;
};

const cards: CardConfig[] = [
  { key: "pending", label: "Pending", icon: Clock, tone: "amber" },
  { key: "processing", label: "In Process", icon: Loader, tone: "brand" },
  { key: "ready", label: "Ready for Claim", icon: Clock, tone: "emerald" },
  { key: "claimed", label: "Claimed", icon: PackageCheck, tone: "neutral" },
  { key: "cancelled", label: "Cancelled", icon: Ban, tone: "red" },
];

function StatsOverview() {
  const { stats, loading, error } = useDashboard();

  if (error) return null;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, label, icon, tone }) => (
        <StatCard
          key={key}
          label={label}
          value={stats?.[key] ?? 0}
          icon={icon}
          tone={tone}
          loading={loading}
        />
      ))}
    </section>
  );
}

export default StatsOverview;
