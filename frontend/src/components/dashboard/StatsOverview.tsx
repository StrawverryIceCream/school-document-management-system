import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { Ban, Clock, Loader, PackageCheck } from "lucide-react";

const cards = [
  { key: "pending" as const, label: "Pending", icon: Clock },
  { key: "processing" as const, label: "In Process", icon: Loader },
  { key: "ready" as const, label: "Ready for Claim", icon: Clock },
  { key: "claimed" as const, label: "Claimed", icon: PackageCheck },
  { key: "rejected" as const, label: "Rejected", icon: Ban },
];

function StatsOverview() {
  const { stats, loading, error } = useDashboard();

  if (error) return null;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(({ key, label, icon: Icon }) => (
        <div
          key={key}
          className="relative rounded-xl border bg-card p-4 shadow-sm"
        >
          <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>

          <div className="pr-10">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">
              {loading ? "—" : stats?.[key] ?? 0}
            </p>
          </div>
        </div>
      ))}
    </section>
  );
}

export default StatsOverview;