import { useMyRequest } from "@/hooks/useMyRequest";

function MyRequestCards() {
  const { totalCount, activeCount, readyCount } = useMyRequest();

  const summaryCards = [
    { label: "Total Requests", value: totalCount },
    { label: "Active Requests", value: activeCount },
    { label: "Ready for Release", value: readyCount },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {summaryCards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border bg-card p-4 shadow-sm"
        >
          <p className="text-sm text-muted-foreground">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight">{card.value}</p>
        </div>
      ))}
    </section>
  );
}

export default MyRequestCards;
