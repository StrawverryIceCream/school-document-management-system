import { useDocuments } from "@/hooks/useDocuments";
import { CheckCircle2, FileText, Slash } from "lucide-react";

function DocumentCards() {
  const { documents, loading, error } = useDocuments();

  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(
    (document) => document.isActive,
  ).length;
  const inactiveDocuments = documents.filter(
    (document) => !document.isActive,
  ).length;

  const summaryCards = [
    { label: "Total Documents", value: totalDocuments, icon: FileText },
    { label: "Active Documents", value: activeDocuments, icon: CheckCircle2 },
    { label: "Inactive Documents", value: inactiveDocuments, icon: Slash },
  ];

  if (error) {
    return (
      <div className="mb-6 flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Something went wrong: {error}
        </p>
      </div>
    );
  }

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border bg-card p-4 shadow-sm h-28 animate-pulse"
            >
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="mt-3 h-9 w-16 rounded bg-muted" />
            </div>
          ))
        : summaryCards.map(({ label, value, icon: Icon }) => (
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

export default DocumentCards;
