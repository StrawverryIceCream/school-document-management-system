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

export default function DocumentCards() {
  const { documents, loading, error } = useDocument();

  if (error) return null;

  const totalDocuments = documents.length;
  const activeDocuments = documents.filter((doc) => doc.isActive).length;
  const inactiveDocuments = documents.filter((doc) => !doc.isActive).length;

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

  return (
    <section
      aria-label="Document statistics"
      className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
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
