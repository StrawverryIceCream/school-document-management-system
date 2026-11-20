import { useState } from "react";
import {
  CheckCircle2,
  Eye,
  FileCheck,
  FileText,
  LoaderCircle,
  Paperclip,
  Receipt,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { reviewPayment, reviewPaymentRefund } from "@/api/payments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AttachmentLink } from "./AttachmentLink";
import { displayValue, formatDate } from "@/lib/sectors/review/format";
import { formatPaymentMetaItems } from "@/lib/sectors/review/preview";
import { FilePreviewDialog } from "@/components/shared/FilePreviewDialog";
import { OfficialReceiptDialog } from "@/components/payments/OfficialReceiptDialog";
import { hasOfficialReceipt } from "@/lib/payments/official-receipt";
import {
  formatRefundMethodLabel,
  PAYMENT_PROOF_ACCEPT,
  PAYMENT_PROOF_MAX_SIZE_LABEL,
  validatePaymentProof,
} from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { ReviewField } from "@/lib/sectors/review/types";
import type { RequestReviewDetails } from "@/api/requests";
import type { Payment, RequestAttachment } from "@/types";

type PaymentActionMode =
  | "verify_payment"
  | "reject_payment"
  | "approve_refund"
  | "reject_refund";

function getRefundStatusDisplay(payment: Payment): {
  label: string;
  badgeClass: string;
} | null {
  if (!payment.refundStatus) return null;
  if (payment.refundStatus === "refunded") {
    return {
      label: "Refund Disbursed",
      badgeClass:
        "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    };
  }
  if (payment.refundStatus === "rejected") {
    return {
      label: "Refund Denied",
      badgeClass:
        "border-destructive/40 bg-destructive/10 text-destructive",
    };
  }
  return {
    label:
      payment.status === "pending"
        ? "Refund Pending Verification"
        : "Refund Pending Payout",
    badgeClass:
      "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  };
}

export function RequestDetailsCard({
  request,
  paymentStatus,
  fields,
  attachments,
  attachmentsError,
  canManageRefunds = false,
  onPaymentUpdated,
}: {
  request: RequestReviewDetails;
  paymentStatus: string | undefined;
  fields: ReviewField[];
  attachments: RequestAttachment[];
  attachmentsError: string | null;
  canManageRefunds?: boolean;
  onPaymentUpdated?: () => Promise<void> | void;
}) {
  const documentType = request.documentType;
  const [previewTarget, setPreviewTarget] = useState<{
    title: string;
    subtitle?: string;
    fileUrl: string | null;
    fileName?: string;
    mimeType?: string | null;
    metaItems?: Array<{ label: string; value: string }>;
  } | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [paymentAction, setPaymentAction] = useState<{
    payment: Payment;
    mode: PaymentActionMode;
  } | null>(null);
  const [actionInput, setActionInput] = useState("");
  const [actionProofFile, setActionProofFile] = useState<File | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  function openPaymentAction(payment: Payment, mode: PaymentActionMode) {
    setPaymentAction({ payment, mode });
    setActionInput("");
    setActionProofFile(null);
    setActionError(null);
  }

  function handleRefundProofChange(
    file: File | null,
    input?: HTMLInputElement,
  ) {
    setActionError(null);
    if (!file) {
      setActionProofFile(null);
      return;
    }
    const validationError = validatePaymentProof(file);
    if (validationError) {
      if (input) input.value = "";
      setActionProofFile(null);
      setActionError(validationError);
      return;
    }
    setActionProofFile(file);
  }

  async function handlePaymentActionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentAction) return;
    setActionError(null);

    const { payment, mode } = paymentAction;
    const trimmed = actionInput.trim();

    if (mode !== "verify_payment" && !trimmed) {
      setActionError(
        mode === "approve_refund"
          ? "Payout reference or voucher number is required."
          : "A reason is required.",
      );
      return;
    }

    setActionSubmitting(true);
    try {
      if (mode === "verify_payment") {
        await reviewPayment(payment.id, { decision: "verified" });
        toast.success("Payment proof verified and official receipt finalized.");
      } else if (mode === "reject_payment") {
        await reviewPayment(payment.id, {
          decision: "rejected",
          rejectionReason: trimmed,
        });
        toast.success("Payment proof rejected.");
      } else if (mode === "approve_refund") {
        await reviewPaymentRefund(payment.id, {
          decision: "refunded",
          payoutReference: trimmed,
          refundProofFile: actionProofFile,
        });
        toast.success("Refund approved and disbursement logged.");
      } else {
        await reviewPaymentRefund(payment.id, {
          decision: "rejected",
          rejectionReason: trimmed,
        });
        toast.success("Refund request denied.");
      }

      setPaymentAction(null);
      await onPaymentUpdated?.();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Could not update payment record.";
      setActionError(msg);
      toast.error(msg);
    } finally {
      setActionSubmitting(false);
    }
  }

  return (
    <Card className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileCheck className="size-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Submitted Document Request Schema
            </h2>
            <span className="text-xs text-muted-foreground">
              {documentType?.name ?? request.documentTypeName} Dynamic Payload
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-xs shrink-0 w-fit">
          Doc Type: {request.documentTypeCode}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Purpose of Request
          </span>
          <p className="text-sm font-medium text-foreground">
            {request.purpose || "Official Record Endorsement"}
          </p>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Copies Required
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {request.copies} {request.copies === 1 ? "Official Copy" : "Official Copies"}
            </span>
            <span className="text-xs text-muted-foreground">Standard Security Paper</span>
          </div>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Payment Status
          </span>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {paymentStatus || (Number(request.amountDue) === 0 ? "Free Assessment / Cleared" : "Pending Verification")}
            </p>
            {hasOfficialReceipt(request) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowReceiptDialog(true)}
                className="h-6 gap-1 px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <Receipt className="size-3" />
                Receipt
              </Button>
            )}
          </div>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Target Claiming Method
          </span>
          <p className="text-sm font-medium text-foreground">
            In-Person Office Pickup ({request.documentType?.officeRecord?.name || (typeof request.documentType?.office === "string" ? request.documentType.office.toUpperCase() : "Designated Office Counter")})
          </p>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Processing Turnaround
          </span>
          <p className="text-sm font-medium text-foreground">
            {request.turnaroundDays} business {request.turnaroundDays === 1 ? "day" : "days"} (Standard)
          </p>
        </div>

        {/* Dynamic Fields */}
        {fields.map((field) => {
          const fieldAttachments = attachments.filter(
            (attachment) => attachment.label === field.key,
          );
          return (
            <div
              key={field.key}
              className={cn(
                "bg-muted/30 p-3.5 rounded-xl border flex flex-col",
                typeof field.value === "string" && field.value.length > 50 && "md:col-span-2",
              )}
            >
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {field.label}
              </span>
              <p className="text-xs sm:text-sm font-medium text-foreground break-words leading-relaxed">
                {displayValue(field.value)}
              </p>
              {field.fileField &&
                fieldAttachments.map((attachment) => (
                  <div key={attachment.id} className="mt-2">
                    <AttachmentLink
                      attachment={attachment}
                      onPreview={(att) =>
                        setPreviewTarget({
                          title: att.fileName || att.label || field.label,
                          subtitle: `Requirement Field: ${field.label}`,
                          fileUrl: att.fileUrl,
                          fileName: att.fileName,
                          mimeType: att.mimeType,
                        })
                      }
                    />
                  </div>
                ))}
            </div>
          );
        })}

        {request.remarks && (
          <div className="md:col-span-2 bg-muted/30 p-3.5 rounded-xl border flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Special Instructions & Requester Note
            </span>
            <p className="text-sm text-foreground/90 italic">
              &ldquo;{request.remarks}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Attached Documents */}
      <div className="pt-2 space-y-3 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Paperclip className="size-3.5" />
            Attached Verification Requirements ({attachments.length} Files)
          </span>
        </div>

        {attachmentsError ? (
          <p className="text-xs text-destructive">{attachmentsError}</p>
        ) : attachments.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
            No supporting document files attached.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="bg-muted/30 p-3 rounded-xl border flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span
                      className="text-xs font-medium text-foreground truncate max-w-[200px] sm:max-w-xs"
                      title={attachment.fileName || attachment.label || "Document Attachment"}
                    >
                      {attachment.fileName || attachment.label || "Document Attachment"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Verified Attachment
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPreviewTarget({
                        title: attachment.fileName || attachment.label || "Attached Requirement",
                        subtitle: attachment.label
                          ? `Requirement Field: ${attachment.label}`
                          : "Student Supporting Document",
                        fileUrl: attachment.fileUrl,
                        fileName: attachment.fileName,
                        mimeType: attachment.mimeType,
                      })
                    }
                    className="gap-1 text-xs font-semibold text-primary cursor-pointer hover:underline"
                  >
                    <Eye className="size-3.5" />
                    Preview
                  </Button>
                  <AttachmentLink attachment={attachment} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment records if any */}
      {request.payments && request.payments.length > 0 && (
        <div className="pt-2 space-y-3 border-t">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Payment Audit Records
          </span>
          <div className="space-y-2">
            {request.payments.map((payment) => {
              const refundBadge = getRefundStatusDisplay(payment);
              return (
                <div
                  key={payment.id}
                  className="space-y-2.5 rounded-xl border bg-muted/20 p-3 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-foreground">
                          ₱{Number(payment.amount).toFixed(2)} ·{" "}
                          {payment.method.replace("_", " ")}
                        </p>
                        {refundBadge && (
                          <Badge
                            variant="outline"
                            className={cn("text-[11px] font-semibold", refundBadge.badgeClass)}
                          >
                            {refundBadge.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        Status: {payment.status} · Submitted:{" "}
                        {formatDate(payment.submittedAt)}
                      </p>
                      {payment.referenceNumber && (
                        <p className="text-muted-foreground">
                          Reference: {payment.referenceNumber}
                        </p>
                      )}
                      {payment.receiptNumber && (
                        <p className="text-muted-foreground">
                          Receipt: {payment.receiptNumber}
                        </p>
                      )}
                      {payment.rejectionReason && (
                        <p className="text-destructive">
                          Reason: {payment.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {payment.status === "verified" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReceiptDialog(true)}
                          className="gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
                        >
                          <Receipt className="size-3.5" />
                          Official Receipt
                        </Button>
                      )}
                      {payment.paymentProofUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setPreviewTarget({
                              title: `Payment Proof (${payment.method.replace(/_/g, " ")})`,
                              subtitle: `Submitted for ${documentType?.name ?? request.documentTypeName}`,
                              fileUrl: payment.paymentProofUrl,
                              fileName: `payment-proof-${payment.id.slice(0, 8)}`,
                              metaItems: formatPaymentMetaItems(payment),
                            })
                          }
                          className="gap-1.5 text-xs font-semibold text-primary cursor-pointer shadow-2xs hover:bg-primary/5"
                        >
                          <Eye className="size-3.5" />
                          Preview proof
                        </Button>
                      )}
                    </div>
                  </div>

                  {payment.refundStatus && (
                    <div className="rounded-lg border bg-background/60 p-2.5 space-y-1 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-foreground">
                          Refund Channel:{" "}
                          {formatRefundMethodLabel(payment.refundMethod || "cash")}
                        </span>
                        {!canManageRefunds && (
                          <span className="text-[11px] text-muted-foreground">
                            Managed by Cashier&apos;s Office (CO)
                          </span>
                        )}
                      </div>
                      {payment.refundAccountName && payment.refundAccountNumber && (
                        <p className="text-muted-foreground">
                          Payout Destination:{" "}
                          <span className="font-medium text-foreground">
                            {payment.refundAccountName} ·{" "}
                            {payment.refundAccountNumber}
                          </span>
                        </p>
                      )}
                      {payment.refundPayoutReference && (
                        <p className="font-mono text-foreground font-semibold">
                          Disbursement Ref: {payment.refundPayoutReference}
                        </p>
                      )}
                      {payment.refundRejectionReason && (
                        <p className="text-destructive">
                          Denial Reason: {payment.refundRejectionReason}
                        </p>
                      )}
                      {(payment.refundQrUrl || payment.refundProofUrl) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {payment.refundQrUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setPreviewTarget({
                                  title: "Requester Receiving Refund QR Code",
                                  subtitle: `For ${documentType?.name ?? request.documentTypeName}`,
                                  fileUrl: payment.refundQrUrl!,
                                  fileName: `refund-qr-${payment.id.slice(0, 8)}`,
                                })
                              }
                              className="h-7 gap-1.5 text-xs font-semibold text-primary cursor-pointer"
                            >
                              <Eye className="size-3.5" aria-hidden="true" />
                              Preview Refund QR
                            </Button>
                          )}
                          {payment.refundProofUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setPreviewTarget({
                                  title: "Refund Disbursement Proof",
                                  subtitle: payment.refundPayoutReference
                                    ? `Ref: ${payment.refundPayoutReference}`
                                    : undefined,
                                  fileUrl: payment.refundProofUrl!,
                                  fileName: `refund-proof-${payment.id.slice(0, 8)}`,
                                })
                              }
                              className="h-7 gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer"
                            >
                              <Eye className="size-3.5" aria-hidden="true" />
                              Preview Refund Receipt
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {canManageRefunds &&
                    payment.refundStatus === "pending" && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            openPaymentAction(payment, "approve_refund")
                          }
                          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          <RotateCcw className="size-3.5" aria-hidden="true" />
                          Approve &amp; Disburse Refund
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openPaymentAction(payment, "reject_refund")
                          }
                          className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                          <XCircle className="size-3.5" aria-hidden="true" />
                          Deny Refund
                        </Button>
                      </div>
                    )}

                  {canManageRefunds &&
                    payment.status === "pending" &&
                    !payment.refundStatus && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            openPaymentAction(payment, "verify_payment")
                          }
                          className="gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                        >
                          <CheckCircle2 className="size-3.5" aria-hidden="true" />
                          Verify Payment
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openPaymentAction(payment, "reject_payment")
                          }
                          className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                          <XCircle className="size-3.5" aria-hidden="true" />
                          Reject Proof
                        </Button>
                      </div>
                    )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <FilePreviewDialog
        open={previewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewTarget(null);
        }}
        title={previewTarget?.title ?? "Document Preview"}
        subtitle={previewTarget?.subtitle}
        fileUrl={previewTarget?.fileUrl ?? null}
        fileName={previewTarget?.fileName}
        mimeType={previewTarget?.mimeType}
        metaItems={previewTarget?.metaItems}
      />

      <OfficialReceiptDialog
        request={request}
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
      />

      <Dialog
        open={paymentAction !== null}
        onOpenChange={(open) => {
          if (!open && !actionSubmitting) setPaymentAction(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentAction?.mode === "verify_payment"
                ? "Verify Payment Proof"
                : paymentAction?.mode === "reject_payment"
                  ? "Reject Payment Proof"
                  : paymentAction?.mode === "approve_refund"
                    ? "Approve & Disburse Fee Refund"
                    : "Deny Fee Refund Request"}
            </DialogTitle>
            <DialogDescription>
              {paymentAction?.mode === "verify_payment"
                ? "Confirm that the transfer or cash payment settled in the university account."
                : paymentAction?.mode === "reject_payment"
                  ? "Explain why this payment proof cannot be accepted."
                  : paymentAction?.mode === "approve_refund"
                    ? paymentAction.payment.status === "pending"
                      ? "Confirm the original payment settled, then record the refund payout reference or cash voucher number."
                      : "Record the refund payout reference or cash voucher number. Any issued Official Receipt will be marked voided."
                    : "Explain why this refund request is denied (for example, no matching transfer landed in the university account)."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePaymentActionSubmit} className="space-y-4">
            {paymentAction?.mode === "approve_refund" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="refund-payout-ref" className="text-xs font-semibold">
                    Payout Reference / Cash Voucher #{" "}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="refund-payout-ref"
                    disabled={actionSubmitting}
                    maxLength={200}
                    placeholder="e.g., GCASH-REF-123456 or CV-2026-0042"
                    value={actionInput}
                    onChange={(e) => {
                      setActionError(null);
                      setActionInput(e.target.value);
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="refund-disbursement-proof" className="text-xs font-semibold">
                    Refund Transfer Receipt Image (Optional)
                  </Label>
                  <Input
                    id="refund-disbursement-proof"
                    type="file"
                    accept={PAYMENT_PROOF_ACCEPT}
                    disabled={actionSubmitting}
                    onChange={(e) =>
                      handleRefundProofChange(
                        e.target.files?.[0] ?? null,
                        e.currentTarget,
                      )
                    }
                    className="cursor-pointer text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Upload transfer screenshot or signed voucher image (up to{" "}
                    {PAYMENT_PROOF_MAX_SIZE_LABEL}).
                  </p>
                </div>
              </div>
            )}

            {(paymentAction?.mode === "reject_payment" ||
              paymentAction?.mode === "reject_refund") && (
              <div className="space-y-1.5">
                <Label htmlFor="payment-action-reason" className="text-xs font-semibold">
                  Reason <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="payment-action-reason"
                  rows={3}
                  maxLength={1000}
                  disabled={actionSubmitting}
                  placeholder="Enter explanation for the requester..."
                  value={actionInput}
                  onChange={(e) => {
                    setActionError(null);
                    setActionInput(e.target.value);
                  }}
                  className="resize-none text-sm"
                />
              </div>
            )}

            {actionError && (
              <p className="text-xs text-destructive" role="alert">
                {actionError}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={actionSubmitting}
                onClick={() => setPaymentAction(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={
                  paymentAction?.mode === "reject_payment" ||
                  paymentAction?.mode === "reject_refund"
                    ? "destructive"
                    : "default"
                }
                disabled={actionSubmitting}
                className="gap-1.5"
              >
                {actionSubmitting && (
                  <LoaderCircle
                    className="size-4 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {paymentAction?.mode === "verify_payment"
                  ? "Confirm Verification"
                  : paymentAction?.mode === "reject_payment"
                    ? "Reject Payment"
                    : paymentAction?.mode === "approve_refund"
                      ? "Confirm Disbursement"
                      : "Deny Refund"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
