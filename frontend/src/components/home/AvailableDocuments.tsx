import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "@/components/shared/PageHeader";
import SmallDocumentCard from "@/components/home/SmallDocumentCard";
import DuplicateRequestDialog from "@/components/requests/new/DuplicateRequestDialog";
import { useAuth } from "@/hooks/useAuth";
import { useDocument } from "@/hooks/useDocument";
import { useMyRequest } from "@/hooks/useMyRequest";
import { initializeDocumentTypeItem } from "@/lib/documents";
import { isDocumentEligible } from "@/lib/documents/eligibility";
import {
  findActiveDuplicateRequest,
  getActiveDocumentTypeIds,
} from "@/lib/requests/duplicate-guard";

type DocumentTypesSectionProps = {
  exploreHref: string;
  onApply: (documentId: string, duplicateConfirmed?: boolean) => void;
};

function AvailableDocuments({
  exploreHref,
  onApply,
}: DocumentTypesSectionProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { documents, loading, error } = useDocument();
  const { requests } = useMyRequest();
  const [duplicateTarget, setDuplicateTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const eligibleDocuments = useMemo(
    () => documents.filter((doc) => isDocumentEligible(doc, user)),
    [documents, user],
  );
  const activeDocumentTypeIds = useMemo(
    () => getActiveDocumentTypeIds(requests),
    [requests],
  );
  const duplicateRequest = useMemo(
    () => findActiveDuplicateRequest(requests, duplicateTarget?.id),
    [requests, duplicateTarget],
  );

  function handleApply(documentId: string, documentName: string) {
    if (findActiveDuplicateRequest(requests, documentId)) {
      setDuplicateTarget({ id: documentId, name: documentName });
      return;
    }
    onApply(documentId);
  }
  const documentItems = eligibleDocuments.slice(0, 4).map((document) =>
    initializeDocumentTypeItem({
      id: String(document.id),
      title: document.name,
      description: document.description ?? "",
      price: Number(document.fee),
      turnaround:
        document.processingDays && document.processingDays > 0
          ? `${document.processingDays} days`
          : "Same-day",
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
          Explore all {eligibleDocuments.length} credentials
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
      ) : eligibleDocuments.length === 0 ? (
        <p className="rounded-2xl bg-muted p-6 text-sm text-muted-foreground">
          No documents are available to request right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {documentItems.map((document) => (
            <SmallDocumentCard
              key={document.id}
              document={document}
              hasActiveRequest={activeDocumentTypeIds.has(document.id)}
              onApply={(docId) => handleApply(docId, document.title)}
            />
          ))}
        </div>
      )}

      <DuplicateRequestDialog
        open={Boolean(duplicateTarget && duplicateRequest)}
        onOpenChange={(open) => {
          if (!open) setDuplicateTarget(null);
        }}
        documentName={duplicateTarget?.name ?? ""}
        existingRequest={duplicateRequest}
        onViewExisting={() => {
          setDuplicateTarget(null);
          navigate("/my-request");
        }}
        onContinue={() => {
          if (!duplicateTarget) return;
          const targetId = duplicateTarget.id;
          setDuplicateTarget(null);
          onApply(targetId, true);
        }}
      />
    </section>
  );
}

export default AvailableDocuments;
