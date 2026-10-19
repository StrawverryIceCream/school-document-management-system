import { useMyRequest } from "@/hooks/useMyRequest";
import { Layers3, Clock3, CheckCircle2 } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

function MyRequestCards() {
  const { totalCount, activeCount, readyCount } = useMyRequest();

  const summaryCards = [
    { label: "Total Requests", value: totalCount, icon: Layers3 },
    { label: "Active Requests", value: activeCount, icon: Clock3 },
    { label: "Ready for Release", value: readyCount, icon: CheckCircle2 },
  ];

  return (
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {summaryCards.map(({ label, value, icon: Icon }) => (
        <StatCard
          label={label}
          value={value}
          caption="Claim Slip validated & stamped"
          icon={Icon}
          tone="emerald"
          tag={{ label: "Claim Window 3", tone: "emerald" }}
        />
      ))}
    </div>
  );
}
export default MyRequestCards;
