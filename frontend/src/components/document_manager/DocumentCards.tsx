import StatCard from "@/components/shared/StatCard";
import { useDocument } from "@/hooks/useDocument";
import type { Tone } from "@/lib/tones";
import { CheckCircle2, FileText, Slash, type LucideIcon } from "lucide-react";

type DocumentSummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
};

function DocumentCards() {
  const { documents, loading, error } = useDocument();

  const totalDocuments = documents.length;
  const activeDocuments = documents.filter(
    (document) => document.isActive,
  ).length;
  const inactiveDocuments = documents.filter(
    (document) => !document.isActive,
  ).length;

  const summaryCards: DocumentSummaryItem[] = [
    {
      label: "Total Documents",
      value: totalDocuments,
      icon: FileText,
      tone: "neutral",
    },
    {
      label: "Active Documents",
      value: activeDocuments,
      icon: CheckCircle2,
      tone: "emerald",
    },
    {
      label: "Inactive Documents",
      value: inactiveDocuments,
      icon: Slash,
      tone: "red",
    },
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
      {summaryCards.map(({ label, value, icon, tone }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
          loading={loading}
        />
      ))}
    </section>
  );
}

export default DocumentCards;
