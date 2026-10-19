import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import SmallDocumentCard from "@/components/home/SmallDocumentCard";
import { useDocument } from "@/hooks/useDocument";
import { initializeDocumentTypeItem } from "@/lib/document";

type DocumentTypesSectionProps = {
  exploreHref: string;
  onApply: (documentId: string) => void;
};

function AvailableDocuments({
  exploreHref,
  onApply,
}: DocumentTypesSectionProps) {
  const { documents, totalCount, loading, error } = useDocument();
  const documentItems = documents.slice(0, 4).map((document) =>
    initializeDocumentTypeItem({
      id: String(document.id),
      title: document.name,
      description: document.description ?? "",
      price: Number(document.fee),
    }),
  );

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Available Documents to Request"
        description="Select an official institutional record to initiate verification and seal processing"
      >
        <Link
          to={exploreHref}
          className="flex shrink-0 items-center gap-2 text-base font-semibold text-primary hover:underline"
        >
          Explore all {totalCount} credentials
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </PageHeader>

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-muted p-6 text-sm text-destructive"
        >
          Could not load available documents: {error}
        </p>
      ) : loading ? (
        <p
          role="status"
          className="rounded-2xl bg-muted p-6 text-sm text-muted-foreground"
        >
          Loading available documents...
        </p>
      ) : documents.length === 0 ? (
        <p className="rounded-2xl bg-muted p-6 text-sm text-muted-foreground">
          No documents are available to request right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {documentItems.map((document) => (
            <SmallDocumentCard
              key={document.id}
              document={document}
              onApply={onApply}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default AvailableDocuments;
