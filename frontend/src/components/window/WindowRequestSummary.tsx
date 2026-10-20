import { useMemo } from "react";
import {
  BadgeCheck,
  Folder,
  Hourglass,
  Timer,
  type LucideIcon,
} from "lucide-react";
import StatCard from "@/components/shared/StatCard";
import { useWindowView } from "@/hooks/useWindowView";
import type { Tone } from "@/lib/tones";

type SummaryItem = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: Tone;
  caption: string;
};

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

  const summaryCards: SummaryItem[] = [
    {
      label: "Total Requests",
      value: departmentRequests.length,
      icon: Folder,
      tone: "brand",
      caption: "Active in counter queue",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: Hourglass,
      tone: "amber",
      caption: "Awaiting staff evaluation",
    },
    {
      label: "Ready for Release",
      value: readyCount,
      icon: BadgeCheck,
      tone: "emerald",
      caption: "Cleared for window pickup",
    },
    {
      label: "Avg Turnaround",
      value: averageTurnaround !== "—" ? `${averageTurnaround}d` : "—",
      icon: Timer,
      tone: "sky",
      caption: "Target < 3.0d SLA",
    },
  ];

  return (
    <section
      aria-label="Request queue summary"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
    >
      {summaryCards.map(({ label, value, icon, tone, caption }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
          caption={caption}
        />
      ))}
    </section>
  );
}
