import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

export default RequestSummary;
