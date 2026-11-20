import { useState } from "react";
import { Check, Clock, Eye, QrCode, Receipt, RotateCcw, Wallet, XCircle } from "lucide-react";
import { FilePreviewDialog } from "@/components/shared/FilePreviewDialog";
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
  formatRefundMethodLabel,
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
  onResubmit?: (request: MyRequestWithDocumentName) => void;
  onCancelRequest?: (request: MyRequestWithDocumentName) => void;
  onClaimRefund?: (request: MyRequestWithDocumentName) => void;
}

export function RequestTimelineDialog({
  request,
  open,
  onOpenChange,
  onOpenClaimSlip,
  onResubmit,
  onCancelRequest,
  onClaimRefund,
}: RequestTimelineDialogProps) {
  const [showReceipt, setShowReceipt] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<{
    title: string;
    subtitle?: string;
    fileUrl: string | null;
    fileName?: string;
  } | null>(null);
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

          {request.status === "rejected" && (
            <div className="sm:col-span-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 space-y-2">
              <div className="space-y-1">
                <span className="font-semibold uppercase tracking-wider text-destructive block">
                  Rejection Reason
                </span>
                <p className="text-sm text-foreground break-words">
                  {request.remarks || "No reason provided."}
                </p>
              </div>
              {request.resubmissionAllowed &&
                (request.missedRequirements?.length ?? 0) > 0 && (
                  <div className="border-t border-destructive/20 pt-2 space-y-1">
                    <span className="font-semibold uppercase tracking-wider text-muted-foreground block">
                      Missed Requirements
                    </span>
                    <ul className="list-disc list-inside text-xs text-foreground space-y-0.5">
                      {request.missedRequirements!.map((item) => (
                        <li key={item.key}>{item.label}</li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}

          {request.status === "cancelled" && request.cancellationReason && (
            <div className="sm:col-span-2 rounded-xl border bg-muted/30 p-3 space-y-1">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground block">
                Cancellation Reason
              </span>
              <p className="text-sm text-foreground break-words">
                {request.cancellationReason}
              </p>
            </div>
          )}

          {cardData.canClaimRefund && cardData.activePayment && (
            <div className="sm:col-span-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
              <span className="font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300 block">
                Fee Refund Eligible to Claim
              </span>
              <p className="text-xs text-muted-foreground">
                Submit your preferred payout channel or receiving QR code so Cashier&apos;s Office (CO) can process your reimbursement.
              </p>
            </div>
          )}

          {cardData.refundStatus && cardData.activePayment && (
            <div
              className={cn(
                "sm:col-span-2 rounded-xl border p-3 space-y-1.5",
                cardData.refundStatus === "refunded"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : cardData.refundStatus === "rejected"
                    ? "border-destructive/30 bg-destructive/10"
                    : "border-amber-500/30 bg-amber-500/10",
              )}
            >
              <span className="font-semibold uppercase tracking-wider text-foreground block">
                {cardData.refundStatus === "refunded"
                  ? "Fee Refund Disbursed"
                  : cardData.refundStatus === "rejected"
                    ? "Fee Refund Denied"
                    : cardData.activePayment.status === "pending"
                      ? "Awaiting Cashier Payment Verification & Refund"
                      : "Fee Refund Pending Payout"}
              </span>
              <p className="text-xs text-muted-foreground">
                Channel:{" "}
                <span className="font-medium text-foreground">
                  {formatRefundMethodLabel(
                    cardData.activePayment.refundMethod || "cash",
                  )}
                </span>
                {cardData.activePayment.refundAccountName &&
                cardData.activePayment.refundAccountNumber
                  ? ` (${cardData.activePayment.refundAccountName} · ${cardData.activePayment.refundAccountNumber})`
                  : ""}
              </p>
              {cardData.activePayment.refundPayoutReference && (
                <p className="font-mono text-xs font-semibold text-foreground">
                  Disbursement Ref: {cardData.activePayment.refundPayoutReference}
                </p>
              )}
              {cardData.activePayment.refundRejectionReason && (
                <p className="text-xs text-destructive">
                  Reason: {cardData.activePayment.refundRejectionReason}
                </p>
              )}
              {(cardData.activePayment.refundQrUrl ||
                cardData.activePayment.refundProofUrl) && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {cardData.activePayment.refundQrUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs cursor-pointer"
                      onClick={() =>
                        setPreviewTarget({
                          title: "Receiving Refund QR Code",
                          subtitle: cardData.referenceNumber,
                          fileUrl: cardData.activePayment!.refundQrUrl!,
                          fileName: `refund-qr-${cardData.referenceNumber}`,
                        })
                      }
                    >
                      <Eye className="size-3" aria-hidden="true" />
                      Preview My QR
                    </Button>
                  )}
                  {cardData.activePayment.refundProofUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-xs cursor-pointer"
                      onClick={() =>
                        setPreviewTarget({
                          title: "Cashier Refund Disbursement Receipt",
                          subtitle: cardData.referenceNumber,
                          fileUrl: cardData.activePayment!.refundProofUrl!,
                          fileName: `refund-receipt-${cardData.referenceNumber}`,
                        })
                      }
                    >
                      <Eye className="size-3" aria-hidden="true" />
                      Preview Refund Receipt
                    </Button>
                  )}
                </div>
              )}
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
            {cardData.canCancel && onCancelRequest && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCancelRequest(request)}
                className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold cursor-pointer"
              >
                <XCircle className="size-4" aria-hidden="true" />
                Cancel Request
              </Button>
            )}
            {(cardData.canClaimRefund || cardData.canUpdateRefund) &&
              onClaimRefund && (
                <Button
                  type="button"
                  variant={cardData.canClaimRefund ? "default" : "outline"}
                  size="sm"
                  onClick={() => onClaimRefund(request)}
                  className="gap-1.5 font-semibold cursor-pointer"
                >
                  <Wallet className="size-4" aria-hidden="true" />
                  {cardData.canClaimRefund
                    ? "Claim Refund / Reimbursement"
                    : "Update Refund / QR"}
                </Button>
              )}
            {request.status === "rejected" &&
              request.resubmissionAllowed &&
              onResubmit && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onResubmit(request)}
                  className="gap-1.5 font-semibold cursor-pointer"
                >
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Fix &amp; Resubmit
                </Button>
              )}
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
      <FilePreviewDialog
        open={previewTarget !== null}
        onOpenChange={(open) => !open && setPreviewTarget(null)}
        title={previewTarget?.title ?? "Preview"}
        subtitle={previewTarget?.subtitle}
        fileUrl={previewTarget?.fileUrl ?? null}
        fileName={previewTarget?.fileName}
      />
    </Dialog>
  );
}

export default RequestTimelineDialog;
