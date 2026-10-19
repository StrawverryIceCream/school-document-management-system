import { useMyRequest } from "@/hooks/useMyRequest";
import { Layers3, Clock3, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/shared/StatCard";

export default function MyRequestCards() {
  const { totalCount, activeCount, readyCount } = useMyRequest();

  const summaryCards = [
    { label: "Total Requests", value: totalCount, icon: Layers3, tone: "neutral" as const },
    { label: "Active Requests", value: activeCount, icon: Clock3, tone: "amber" as const },
    { label: "Ready for Release", value: readyCount, icon: CheckCircle2, tone: "emerald" as const },
  ];

  return (
    <section
      aria-label="Personal request summary"
      className="grid shrink-0 gap-4 md:grid-cols-2 xl:grid-cols-3"
    >
      {summaryCards.map(({ label, value, icon: Icon, tone }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={Icon}
          tone={tone}
        />
      ))}
    </section>
  );
}
