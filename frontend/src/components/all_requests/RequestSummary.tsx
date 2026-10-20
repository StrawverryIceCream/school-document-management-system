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
  caption: string;
};

export default function RequestSummary() {
  const { summary } = useRequests();

  const summaryCards: RequestSummaryItem[] = [
    {
      label: "Total Requests",
      value: summary.total,
      icon: Layers3,
      tone: "brand",
      caption: "Across all colleges and offices",
    },
    {
      label: "Pending",
      value: summary.pending,
      icon: Clock3,
      tone: "amber",
      caption: "Awaiting evaluation & payment",
    },
    {
      label: "Processing",
      value: summary.processing,
      icon: Activity,
      tone: "brand",
      caption: "In verification & print queue",
    },
    {
      label: "Ready",
      value: summary.ready,
      icon: CheckCircle2,
      tone: "emerald",
      caption: "Completed for student release",
    },
  ];

  return (
    <section
      aria-label="Request status overview"
      className="grid shrink-0 gap-4 sm:grid-cols-2 xl:grid-cols-4"
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
