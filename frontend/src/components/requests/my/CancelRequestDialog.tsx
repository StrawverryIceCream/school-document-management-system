import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  ImageUp,
  Landmark,
  LoaderCircle,
  QrCode,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { claimPaymentRefund } from "@/api/payments";
import { cancelMyRequest } from "@/api/requests";
import { Button } from "@/components/ui/button";
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
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import { formatPeso } from "@/lib/format";
import {
  PAYMENT_PROOF_ACCEPT,
  PAYMENT_PROOF_MAX_SIZE_LABEL,
  validatePaymentProof,
} from "@/lib/requests";
import { formatRequestCardData } from "@/lib/requests/request-card";
import { TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { RefundMethod } from "@/types";

const CANCEL_REASON_PRESETS = [
  "Ordered wrong document type",
  "No longer needed",
  "Duplicate submission",
  "Updating academic records first",
] as const;

const REFUND_METHOD_OPTIONS: Array<{
  value: RefundMethod;
  label: string;
  description: string;
  icon: typeof Wallet;
}> = [
  {
    value: "e_wallet",
    label: "E-Wallet",
    description: "GCash / Maya transfer",
    icon: Wallet,
  },
  {
    value: "bank_transfer",
    label: "Bank Transfer",
    description: "MariBank / GoTyme / BDO / InstaPay",
    icon: Landmark,
  },
  {
    value: "cash",
    label: "Cash Pickup",
    description: "Claim at Cashier's Office (CO)",
    icon: Banknote,
  },
];

interface CancelRequestDialogProps {
  request: MyRequestWithDocumentName | null;
  mode?: "cancel" | "claim_refund";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void> | void;
}

export default function CancelRequestDialog({
  request,
  mode = "cancel",
  open,
  onOpenChange,
  onSuccess,
}: CancelRequestDialogProps) {
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState<RefundMethod>("e_wallet");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dialogKey =
    open && request ? `${mode}:${request.id}:${request.updatedAt}` : null;
  if (dialogKey !== prevKey) {
    setPrevKey(dialogKey);
    if (dialogKey && request) {
      const cardData = formatRequestCardData(request);
      const existingMethod = cardData.activePayment?.refundMethod;
      const initialMethod: RefundMethod =
        existingMethod ??
        (cardData.activePayment?.method === "cash" ? "cash" : "e_wallet");
      setReason("");
      setRefundMethod(initialMethod);
      setAccountName(cardData.activePayment?.refundAccountName ?? "");
      setAccountNumber(cardData.activePayment?.refundAccountNumber ?? "");
      setQrFile(null);
      setError(null);
    }
  }

  const qrPreviewUrl = useMemo(
    () => (qrFile ? URL.createObjectURL(qrFile) : null),
    [qrFile],
  );

  useEffect(
    () => () => {
      if (qrPreviewUrl) URL.revokeObjectURL(qrPreviewUrl);
    },
    [qrPreviewUrl],
  );

  if (!request) return null;

  const isClaimMode = mode === "claim_refund";
  const cardData = formatRequestCardData(request);
  const activePayment = cardData.activePayment;
  const requiresRefund =
    isClaimMode || (cardData.hasActivePayment && activePayment !== null);
  const needsTransferAccount =
    requiresRefund &&
    (refundMethod === "e_wallet" || refundMethod === "bank_transfer");
  const hasExistingQr = Boolean(activePayment?.refundQrUrl);
  const isUpdatingClaim =
    isClaimMode && activePayment?.refundStatus === "pending";

  function handleQrFileChange(
    file: File | null,
    input?: HTMLInputElement,
  ) {
    setError(null);
    if (!file) {
      setQrFile(null);
      return;
    }

    const validationError = validatePaymentProof(file);
    if (validationError) {
      if (input) input.value = "";
      setQrFile(null);
      setError(validationError);
      return;
    }

    setQrFile(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    setError(null);

    const trimmedReason = reason.trim();
    if (!isClaimMode && !trimmedReason) {
      setError("Please provide a reason for cancelling this request.");
      return;
    }

    const hasAnyQr = Boolean(qrFile || hasExistingQr);
    if (needsTransferAccount && !hasAnyQr) {
      if (!accountName.trim() || !accountNumber.trim()) {
        setError(
          "Provide account holder name and account/mobile number, or upload your receiving QR code image.",
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      if (isClaimMode) {
        if (!activePayment) {
          throw new Error("No refundable payment record was found.");
        }
        await claimPaymentRefund(activePayment.id, {
          refundMethod,
          ...(needsTransferAccount
            ? {
                refundAccountName: accountName.trim() || undefined,
                refundAccountNumber: accountNumber.trim() || undefined,
                refundQrFile: qrFile,
              }
            : {}),
        });
        toast.success(
          isUpdatingClaim
            ? "Refund payout details updated."
            : "Refund claim submitted to Cashier's Office.",
        );
      } else {
        await cancelMyRequest(request.id, {
          reason: trimmedReason,
          ...(requiresRefund
            ? {
                refundMethod,
                ...(needsTransferAccount
                  ? {
                      refundAccountName: accountName.trim() || undefined,
                      refundAccountNumber: accountNumber.trim() || undefined,
                      refundQrFile: qrFile,
                    }
                  : {}),
              }
            : {}),
        });
        toast.success(
          requiresRefund
            ? "Request cancelled and fee refund request submitted."
            : "Request cancelled.",
        );
      }
      await onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : isClaimMode
            ? "Could not submit refund claim."
            : "Could not cancel request.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  const terminationNotice =
    request.cancellationReason || request.remarks || null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && submitting) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            {isClaimMode ? (
              <QrCode className="size-4 text-primary" aria-hidden="true" />
            ) : (
              <XCircle className="size-4 text-destructive" aria-hidden="true" />
            )}
            {isClaimMode
              ? isUpdatingClaim
                ? "Update Refund Payout / QR Details"
                : "Claim Fee Refund / Reimbursement"
              : "Cancel Document Request"}
          </DialogTitle>
          <DialogDescription>
            {request.documentName} &bull;{" "}
            <span className="font-mono font-semibold text-foreground">
              {cardData.referenceNumber}
            </span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isClaimMode && terminationNotice && (
            <div className="rounded-xl border bg-muted/30 p-3 text-xs space-y-1">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground block">
                {request.status === "rejected"
                  ? "Rejection Reason"
                  : "Cancellation Reason"}
              </span>
              <p className="text-sm text-foreground break-words">
                {terminationNotice}
              </p>
            </div>
          )}

          {requiresRefund && activePayment && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs space-y-1.5">
              <p className="font-semibold text-amber-800 dark:text-amber-300">
                Fee Refund Eligible:{" "}
                {formatPeso(Number(activePayment.amount || request.amountDue))}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {activePayment.status === "pending"
                  ? "Your Payment Proof is awaiting verification. Cashier's Office (CO) will confirm your transfer landed in the university account before disbursing your refund."
                  : "Your verified Official Receipt will be marked voided and Cashier's Office (CO) will disburse your refund via the channel you select below."}
              </p>
            </div>
          )}

          {!isClaimMode && (
            <div className="space-y-2">
              <Label
                htmlFor="cancel-request-reason"
                className="text-xs font-semibold"
              >
                Reason for cancellation{" "}
                <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {CANCEL_REASON_PRESETS.map((preset) => {
                  const selected = reason === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      disabled={submitting}
                      onClick={() => {
                        setError(null);
                        setReason(preset);
                      }}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs text-left transition-colors cursor-pointer",
                        selected
                          ? "border-destructive/60 bg-destructive/15 text-destructive font-medium"
                          : "border-border/70 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
              <Textarea
                id="cancel-request-reason"
                rows={3}
                maxLength={1000}
                disabled={submitting}
                placeholder="Explain why you are cancelling this request..."
                value={reason}
                onChange={(e) => {
                  setError(null);
                  setReason(e.target.value);
                }}
                className="resize-none text-sm"
              />
            </div>
          )}

          {requiresRefund && (
            <div className="space-y-3 rounded-xl border bg-muted/20 p-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Preferred Refund Method{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {REFUND_METHOD_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const active = refundMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        disabled={submitting}
                        aria-pressed={active}
                        onClick={() => {
                          setError(null);
                          setRefundMethod(opt.value);
                        }}
                        className={cn(
                          "flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-colors cursor-pointer",
                          active
                            ? cn(
                                TONES.brand.badge,
                                "border-primary/40 ring-1 ring-primary/20",
                              )
                            : "bg-background hover:bg-muted/40 border-border/70",
                        )}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <Icon
                            className="size-3.5 shrink-0"
                            aria-hidden="true"
                          />
                          {opt.label}
                        </div>
                        <span className="text-[11px] text-muted-foreground leading-tight">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {needsTransferAccount ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="refund-account-name"
                        className="text-xs font-semibold"
                      >
                        Account Holder Name{" "}
                        {!qrFile && !hasExistingQr && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <Input
                        id="refund-account-name"
                        disabled={submitting}
                        maxLength={200}
                        placeholder="e.g., Juan Dela Cruz"
                        value={accountName}
                        onChange={(e) => {
                          setError(null);
                          setAccountName(e.target.value);
                        }}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="refund-account-number"
                        className="text-xs font-semibold"
                      >
                        {refundMethod === "e_wallet"
                          ? "Wallet & Mobile Number"
                          : "Bank & Account Number"}{" "}
                        {!qrFile && !hasExistingQr && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      <Input
                        id="refund-account-number"
                        disabled={submitting}
                        maxLength={200}
                        placeholder={
                          refundMethod === "e_wallet"
                            ? "e.g., GCash 0917 123 4567"
                            : "e.g., MariBank 1234-5678-90"
                        }
                        value={accountNumber}
                        onChange={(e) => {
                          setError(null);
                          setAccountNumber(e.target.value);
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="refund-qr-upload"
                      className="text-xs font-semibold flex items-center gap-1.5"
                    >
                      <ImageUp className="size-3.5 text-primary" aria-hidden="true" />
                      Receiving QR Code / Picture (Optional if account details filled)
                    </Label>
                    <Input
                      id="refund-qr-upload"
                      type="file"
                      accept={PAYMENT_PROOF_ACCEPT}
                      disabled={submitting}
                      onChange={(e) =>
                        handleQrFileChange(
                          e.target.files?.[0] ?? null,
                          e.currentTarget,
                        )
                      }
                      className="cursor-pointer text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Upload your personal GCash, Maya, or bank QR Ph image (JPG, PNG, WebP, or AVIF up to {PAYMENT_PROOF_MAX_SIZE_LABEL}).
                    </p>
                    {(qrPreviewUrl || activePayment?.refundQrUrl) && (
                      <div className="rounded-lg border bg-background p-2.5 space-y-1.5">
                        <p className="text-[11px] font-medium text-foreground">
                          {qrFile
                            ? `Selected QR image: ${qrFile.name}`
                            : "Current uploaded receiving QR code:"}
                        </p>
                        <img
                          src={qrPreviewUrl ?? activePayment?.refundQrUrl ?? ""}
                          alt="Receiving refund QR code preview"
                          className="mx-auto max-h-40 rounded-md object-contain bg-white p-1"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Bring your student/employee ID and tracking number{" "}
                  <span className="font-mono font-semibold text-foreground">
                    {cardData.referenceNumber}
                  </span>{" "}
                  to the Cashier&apos;s Office (CO) once notified that your
                  refund is ready.
                </p>
              )}
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              {isClaimMode ? "Close" : "Keep Request"}
            </Button>
            <Button
              type="submit"
              variant={isClaimMode ? "default" : "destructive"}
              disabled={submitting}
              className="gap-1.5"
            >
              {submitting && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {submitting
                ? isClaimMode
                  ? "Submitting..."
                  : "Cancelling..."
                : isClaimMode
                  ? isUpdatingClaim
                    ? "Save Refund Details"
                    : "Submit Refund Claim"
                  : requiresRefund
                    ? "Cancel & Request Refund"
                    : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
