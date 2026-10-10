import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import SmallDocumentCard from "@/components/home/SmallDocumentCard";
import { cn } from "@/lib/utils";
import type { DocumentTypeItem } from "@/lib/document";

type DocumentTypesSectionProps = Omit<
  React.ComponentProps<"section">,
  "children"
> & {
  documents: DocumentTypeItem[];
  totalCount: number;
  exploreHref: string;
  onApply: (documentId: string) => void;
};

function AvailableDocuments({
  className,
  documents,
  totalCount,
  exploreHref,
  onApply,
  ...props
}: DocumentTypesSectionProps) {
  return (
    <section className={cn("flex flex-col gap-5", className)} {...props}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Available Documents to Request
          </h2>
          <p className="text-sm text-muted-foreground">
            Select an official institutional record to initiate verification and
            seal processing
          </p>
        </div>
        <Link
          to={exploreHref}
          className="flex shrink-0 items-center gap-2 text-base font-semibold text-primary hover:underline"
        >
          Explore all {totalCount} credentials
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {documents.length === 0 ? (
        <p className="rounded-2xl bg-muted p-6 text-sm text-muted-foreground">
          No documents are available to request right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {documents.map((document) => (
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
