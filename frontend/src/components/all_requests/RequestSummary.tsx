import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock3, Layers3 } from "lucide-react";

interface RequestSummaryProps {
  total: number;
  pending: number;
  processing: number;
  ready: number;
}

function RequestSummary({ total, pending, processing, ready }: RequestSummaryProps) {
  const summaryCards = [
    { label: "Total requests", value: total, icon: Layers3 },
    { label: "Pending", value: pending, icon: Clock3 },
    { label: "Processing", value: processing, icon: Activity },
    { label: "Ready", value: ready, icon: CheckCircle2 },
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
