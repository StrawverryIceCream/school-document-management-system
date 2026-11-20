import { useMemo } from "react";
import StatCard from "@/components/shared/StatCard";
import { useAuth } from "@/hooks/useAuth";
import { useDocument } from "@/hooks/useDocument";
import { filterDocumentsForManager } from "@/lib/documents";
import type { Tone } from "@/lib/tones";
import { CheckCircle2, FileText, Slash, type LucideIcon } from "lucide-react";

type DocumentSummaryItem = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: Tone;
  caption: string;
};

export default function DocumentCards() {
  const { user } = useAuth();
  const { documents, loading, error } = useDocument();

  const scopedDocuments = useMemo(
    () => filterDocumentsForManager(documents, user),
    [documents, user],
  );

  if (error) return null;

  const totalDocuments = scopedDocuments.length;
  const activeDocuments = scopedDocuments.filter((doc) => doc.isActive).length;
  const inactiveDocuments = scopedDocuments.filter((doc) => !doc.isActive).length;
  const isStaff = user?.role === "staff";

  const summaryCards: DocumentSummaryItem[] = [
    {
      label: "Total Documents",
      value: totalDocuments,
      icon: FileText,
      tone: "brand",
      caption: isStaff
        ? "Assigned to your processing office"
        : "Configured document catalog",
    },
    {
      label: "Active Documents",
      value: activeDocuments,
      icon: CheckCircle2,
      tone: "emerald",
      caption: "Available for student requests",
    },
    {
      label: "Inactive Documents",
      value: inactiveDocuments,
      icon: Slash,
      tone: "rose",
      caption: "Archived or disabled types",
    },
  ];

  return (
    <section
      aria-label="Document statistics"
      className="grid shrink-0 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {summaryCards.map(({ label, value, icon, tone, caption }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={icon}
          tone={tone}
          caption={caption}
          loading={loading}
        />
      ))}
    </section>
  );
}
