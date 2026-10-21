import { Banknote, Check, CircleCheck, Clock, Plus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDocument } from "@/hooks/useDocument";
import {
  getRequestFormPath,
  NO_DESCRIPTION_LABEL,
} from "@/lib/documents";
import { formatPeso } from "@/lib/format";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { CARD_HOVER_LIFT, cn } from "@/lib/utils";

const CHIP_CLASS_NAME = "rounded-lg px-3 py-1.5 font-medium";

export default function DocumentGrid() {
  const { documents, loading, error, refreshDocument } = useDocument();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Inactive document types can't be requested, so they never reach the grid
  const requestableDocuments = documents.filter(
    (documentType) => documentType.isActive,
  );

  if (loading) {
    return (
      <p className="p-6 text-base text-muted-foreground" role="status">
        Loading documents...
      </p>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3 p-6" role="alert">
        <p className="text-base text-destructive">{error}</p>
        <Button variant="secondary" onClick={() => void refreshDocument()}>
          Try again
        </Button>
      </div>
    );
  }

  if (requestableDocuments.length === 0) {
    return (
      <p className="p-6 text-base text-muted-foreground">
        No documents are available to request right now.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {requestableDocuments.map((documentType) => {
        const isSelected = documentType.id === selectedId;
        const fee = Number(documentType.fee);
        const isFree = !Number.isFinite(fee) || fee <= 0;
        const feeLabel = isFree ? "Free (No fee)" : formatPeso(fee);

        const officeName =
          documentType.officeRecord?.name ??
          documentType.officeRecord?.code ??
          documentType.office ??
          "University Office";
        const officeCode =
          documentType.officeRecord?.code ??
          (documentType.code.includes("-")
            ? documentType.code.split("-")[0]
            : "OUR");

        const processingDays = documentType.processingDays ?? 3;
        const turnaroundLabel =
          processingDays > 0
            ? `${processingDays} working ${processingDays === 1 ? "day" : "days"}`
            : "Same-day issuance";

        const maxCopies = documentType.maxCopies ?? 1;
        const copyLabel =
          maxCopies > 1
            ? `Up to ${maxCopies} copies`
            : "Single copy issuance";

        return (
          <Card
            key={documentType.id}
            className={cn(
              "flex flex-col justify-between gap-4 rounded-2xl border-2 p-6 shadow-sm transition-colors",
              isSelected ? "border-primary" : "border-border",
              CARD_HOVER_LIFT,
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <Badge
                variant="secondary"
                className={cn(
                  BADGE_BASE,
                  "rounded-lg font-mono",
                  isSelected ? TONES.brand.badge : TONES.neutral.badge,
                )}
              >
                {documentType.code}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(BADGE_BASE, TONES.sky.badge)}
                title={officeName}
              >
                {officeCode}
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-xl font-bold leading-snug text-foreground">
                  {documentType.name}
                </h3>
                {isSelected && (
                  <CircleCheck
                    className="size-6 shrink-0 text-primary"
                    aria-label="Selected"
                  />
                )}
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {documentType.description || NO_DESCRIPTION_LABEL}
              </p>
              <p className="text-xs font-medium text-muted-foreground/80 truncate" title={officeName}>
                Issuing: {officeName}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 pt-2 border-t border-border/50">
              <Badge
                variant="secondary"
                className={cn(BADGE_BASE, CHIP_CLASS_NAME, TONES.neutral.badge)}
              >
                <Clock className="size-4" aria-hidden="true" />
                {turnaroundLabel}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  BADGE_BASE,
                  CHIP_CLASS_NAME,
                  isFree ? TONES.emerald.badge : TONES.amber.badge,
                )}
              >
                <Banknote className="size-4" aria-hidden="true" />
                Fee: {feeLabel}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(
                  BADGE_BASE,
                  CHIP_CLASS_NAME,
                  TONES.neutral.badge,
                )}
              >
                {copyLabel}
              </Badge>
            </div>

            <Button
              size="lg"
              variant={isSelected ? "default" : "outline"}
              className="mt-2 w-full text-base font-semibold h-11"
              aria-pressed={isSelected}
              onClick={() =>
                isSelected
                  ? navigate(getRequestFormPath(documentType.id))
                  : setSelectedId(documentType.id)
              }
            >
              {isSelected ? (
                <>
                  Selected &amp; Proceed
                  <Check className="size-5" aria-hidden="true" />
                </>
              ) : (
                <>
                  Select Document
                  <Plus className="size-5" aria-hidden="true" />
                </>
              )}
            </Button>
          </Card>
        );
      })}
    </div>
  );
}
