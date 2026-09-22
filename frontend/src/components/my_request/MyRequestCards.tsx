import { Card, CardContent } from "@/components/ui/card";

const summaryCards = [
  { label: "Total Requests", value: 0 },
  { label: "Active Requests", value: 0 },
  { label: "Ready for Release", value: 0 },
];

function MyRequestCards() {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaryCards.map((card) => (
        <Card key={card.label} className="rounded-xl border bg-card shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export default MyRequestCards;
