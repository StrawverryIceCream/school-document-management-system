import StatCard from "@/components/shared/StatCard";
import { useRequests } from "@/hooks/useRequest";
import type { Tone } from "@/lib/tones";
import {
  Activity,
  CheckCircle2,
  Clock3,
  Layers3,
  type LucideIcon,
} from "lucide-react";

type RequestSummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
};

function RequestSummary() {
  const { summary } = useRequests();

  const summaryCards: RequestSummaryItem[] = [
    {
      label: "Total requests",
      value: summary.total,
      icon: Layers3,
      tone: "neutral",
    },
    { label: "Pending", value: summary.pending, icon: Clock3, tone: "amber" },
    {
      label: "Processing",
      value: summary.processing,
      icon: Activity,
      tone: "brand",
    },
    {
      label: "Ready",
      value: summary.ready,
      icon: CheckCircle2,
      tone: "emerald",
    },
  ];

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map(({ label, value, icon, tone }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
        />
      ))}
    </section>
  );
}

export default RequestSummary;
