import { AlertTriangle, Calendar, FileText, Hash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { DuplicateCandidate } from "@/lib/requests/duplicate-guard";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { requestStatusLabels } from "@/types";

interface DuplicateRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string;
  existingRequest: DuplicateCandidate | null;
  onViewExisting: () => void;
  onContinue: () => void;
}

function formatSubmittedDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DuplicateRequestDialog({
  open,
  onOpenChange,
  documentName,
  existingRequest,
  onViewExisting,
  onContinue,
}: DuplicateRequestDialogProps) {
  if (!existingRequest) return null;

  const statusLabel =
    requestStatusLabels[existingRequest.status] ?? existingRequest.status;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="size-5" aria-hidden="true" />
            </span>
            <AlertDialogTitle className="text-left text-base font-bold">
              Active Request Already Exists
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left text-sm leading-relaxed">
            You already have an active request for{" "}
            <span className="font-semibold text-foreground">{documentName}</span>
            . Submitting another request will create a separate copy and fee
            assessment.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 rounded-xl border bg-muted/40 p-3.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Hash className="size-3.5" aria-hidden="true" />
              Reference
            </span>
            <span className="font-mono font-bold text-foreground">
              {existingRequest.referenceNumber}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <FileText className="size-3.5" aria-hidden="true" />
              Status
            </span>
            <Badge
              variant="secondary"
              className={cn(BADGE_BASE, TONES.amber.badge)}
            >
              {statusLabel}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5" aria-hidden="true" />
              Submitted
            </span>
            <span className="font-medium text-foreground">
              {formatSubmittedDate(existingRequest.createdAt)}
            </span>
          </div>
        </div>

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel onClick={onContinue}>
            Continue Anyway
          </AlertDialogCancel>
          <AlertDialogAction onClick={onViewExisting}>
            View Existing Request
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
