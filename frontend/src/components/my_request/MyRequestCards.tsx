import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyRequest } from "@/hooks/useMyRequest";
import { Layers3, Clock3, CheckCircle2 } from "lucide-react";

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
        <Card key={label} className="border-border/80 bg-card/80">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            <div className="rounded-md bg-muted p-2">
              <Icon className="size-4 text-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default MyRequestCards;
