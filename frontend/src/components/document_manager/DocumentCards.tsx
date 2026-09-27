import { useDocuments } from "@/hooks/useDocuments";

function DocumentCards() {
  const { documents, loading, error } = useDocuments();

  const totalDocuments = documents.length;
  const activeDocuments = documents.filter((document) => document.isActive).length;
  const inactiveDocuments = documents.filter((document) => !document.isActive).length;

  const summaryCards = [
    { label: "Total Documents", value: totalDocuments },
    { label: "Active Documents", value: activeDocuments },
    { label: "Inactive Documents", value: inactiveDocuments },
  ];

  if (error) return null;

  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border bg-card p-4 shadow-sm animate-pulse"
            >
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="mt-3 h-9 w-16 rounded bg-muted" />
            </div>
          ))
        : summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">
                {card.value}
              </p>
            </div>
          ))}
    </section>
  );
}

export default DocumentCards;
