import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import { Clock, Loader, PackageCheck, Wallet } from "lucide-react";

const cards = [
  { key: "submitted" as const, label: "Submitted", icon: Clock },
  { key: "pending_payment" as const, label: "Pending Payment", icon: Wallet },
  { key: "processing" as const, label: "In Process", icon: Loader },
  { key: "ready" as const, label: "Ready for Claim", icon: Clock },
  { key: "claimed" as const, label: "Claimed", icon: PackageCheck },
];

function StatsOverview() {
  const { stats, loading } = useDashboard();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map(({ key, label, icon: Icon }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "—" : stats?.[key] ?? 0}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default StatsOverview;