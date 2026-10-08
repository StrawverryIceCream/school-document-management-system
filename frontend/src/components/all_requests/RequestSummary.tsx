import { Activity, CheckCircle2, Clock3, Layers3 } from "lucide-react";
import { useRequests } from "@/hooks/useRequests";

function RequestSummary() {
  const { summary } = useRequests();
  const summaryCards = [
    { label: "Total requests", value: summary.total, icon: Layers3 },
    { label: "Pending", value: summary.pending, icon: Clock3 },
    { label: "Processing", value: summary.processing, icon: Activity },
    { label: "Ready", value: summary.ready, icon: CheckCircle2 },
  ];

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryCards.map(({ label, value, icon: Icon }) => (
        <div
          key={label}
          className="relative rounded-xl border bg-card p-4 shadow-sm h-28"
        >
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>

          <div className="pr-10 flex flex-col justify-between h-full">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default RequestSummary;
