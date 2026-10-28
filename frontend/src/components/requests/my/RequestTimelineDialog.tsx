import { useState } from "react";
import { Check, Clock, QrCode, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OfficialReceiptDialog } from "@/components/payments/OfficialReceiptDialog";
import { hasOfficialReceipt } from "@/lib/payments/official-receipt";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import {
  formatClaimPeriod,
  formatRequestCardData,
  getStepDates,
  STATUS_CONFIGS,
  STEP_LABELS,
} from "@/lib/requests";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

interface RequestTimelineDialogProps {
  request: MyRequestWithDocumentName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenClaimSlip?: (request: MyRequestWithDocumentName) => void;
}

export function RequestTimelineDialog({
  request,
  open,
  onOpenChange,
  onOpenClaimSlip,
}: RequestTimelineDialogProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  if (!request) return null;

  const config = STATUS_CONFIGS[request.status];
  const cardData = formatRequestCardData(request);
  const stepDates = getStepDates(request);
  const claimPeriod = formatClaimPeriod(request.releaseDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto gap-5 p-6">
        <DialogHeader className="gap-2 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <span className="font-mono text-sm font-bold text-primary">
              {cardData.referenceNumber}
            </span>
            <Badge
              variant="secondary"
              className={cn(
                BADGE_BASE,
                "gap-1.5 px-2.5 py-0.5 text-xs",
                TONES[config.tone].badge,
              )}
            >
              <span className={cn("size-1.5 rounded-full", TONES[config.tone].dot)} />
              {config.label}
            </Badge>
          </div>

          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {request.documentName}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Lifecycle progress and verification stages for your submitted scholastic record.
          </DialogDescription>
        </DialogHeader>

        {/* 4-Step Visual Stepper */}
        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Progress Stages ({config.completedSteps} of {STEP_LABELS.length} Completed)
          </span>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {STEP_LABELS.map((label, index) => {
              const isCompleted = index < config.completedSteps;
              const isCurrent =
                index === config.completedSteps - 1 &&
                request.status !== "ready" &&
                request.status !== "claimed";
              const dateStr = stepDates[index];

              return (
                <div key={label} className="flex flex-col items-center text-center gap-1.5">
                  <div
                    className={cn(
                      "size-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border border-border",
                      isCurrent && "ring-2 ring-primary/30 ring-offset-1 bg-primary/90 text-primary-foreground",
                    )}
                  >
                    {isCompleted ? <Check className="size-4 stroke-[3]" /> : index + 1}
                  </div>
                  <span className="text-xs font-semibold text-foreground leading-tight">
                    {label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {dateStr}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Request Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Processing Office</span>
            <p className="font-semibold text-foreground text-sm">{cardData.officeName}</p>
          </div>

          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Payment Status</span>
            <p className="font-semibold text-foreground text-sm">{cardData.paymentStatusText}</p>
          </div>

          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Target Release Date</span>
            <p className="font-semibold text-foreground text-sm flex items-center gap-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              {request.releaseDate || "Pending assessment"}
            </p>
          </div>

          <div className="bg-muted/20 border rounded-xl p-3 space-y-1">
            <span className="text-muted-foreground font-medium">Copies Requested</span>
            <p className="font-semibold text-foreground text-sm">
              {request.copies} {request.copies === 1 ? "Official Copy" : "Official Copies"}
            </p>
          </div>

          {request.purpose && (
            <div className="sm:col-span-2 bg-muted/20 border rounded-xl p-3 space-y-1">
              <span className="text-muted-foreground font-medium">Purpose</span>
              <p className="font-medium text-foreground">{request.purpose}</p>
            </div>
          )}

          {claimPeriod && (
            <div className="sm:col-span-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 space-y-1">
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Available for Counter Claiming</span>
              <p className="text-emerald-800 dark:text-emerald-200 font-medium">
                Claim period: {claimPeriod}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between items-center gap-2 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {config.canClaim && onOpenClaimSlip ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={() => onOpenClaimSlip(request)}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
              >
                <QrCode className="size-4" />
                Present Claim Slip QR
              </Button>
            ) : null}
            {hasOfficialReceipt(request) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowReceipt(true)}
                className="gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 font-semibold cursor-pointer"
              >
                <Receipt className="size-4" />
                Official Receipt
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>

      <OfficialReceiptDialog
        request={request}
        open={showReceipt}
        onOpenChange={setShowReceipt}
      />
    </Dialog>
  );
}

export default RequestTimelineDialog;
