import { useState } from "react";
import {
  AlertCircle,
  Banknote,
  Check,
  Copy,
  Landmark,
  QrCode,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PaymentMethod } from "@/api/payments";
import PaymentReceiptAttachment from "./PaymentReceiptAttachment";
import { cn } from "@/lib/utils";
import { TONES } from "@/lib/tones";
import { validatePaymentProof } from "@/lib/requests";
import {
  DEFAULT_PAYMENT_METHOD,
  PAYMENT_PORTALS,
  getInitialPortal,
  getPortalPaymentDetails,
  type OnlinePaymentMethod,
  type PaymentPortal,
} from "@/lib/payment-portal";

interface OnlinePaymentProps {
  documentName: string;
  feeLabel: string;
  isRetry: boolean;
  initialMethod?: OnlinePaymentMethod;
  onMethodChange: (method: OnlinePaymentMethod) => void;
  onConfirm: (method: PaymentMethod, proofFile: File) => void | Promise<void>;
}

function OnlinePayment({
  documentName,
  feeLabel,
  isRetry,
  initialMethod = DEFAULT_PAYMENT_METHOD,
  onMethodChange,
  onConfirm,
}: OnlinePaymentProps) {
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [method, setMethod] = useState<OnlinePaymentMethod>(initialMethod);
  const [portal, setPortal] = useState<PaymentPortal>(
    getInitialPortal(initialMethod),
  );
  const [copied, setCopied] = useState(false);
  const [enlarged, setEnlarged] = useState(false);

  function choosePortal(
    portalId: PaymentPortal,
    paymentMethod: OnlinePaymentMethod,
  ) {
    setPortal(portalId);
    setMethod(paymentMethod);
    onMethodChange(paymentMethod);
  }

  async function copyMobileNumber(num: string) {
    try {
      await navigator.clipboard.writeText(num);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: clipboard permission denied or unsupported
    }
  }

  function handleReceiptChange(file: File | undefined) {
    setSubmitError(null);

    // Browsers clear the input when the picker is cancelled; keep state in sync
    if (!file) {
      setReceipt(null);
      setReceiptError(null);
      return;
    }

    const validationError = validatePaymentProof(file);
    if (validationError) {
      setReceipt(null);
      setReceiptError(validationError);
      return;
    }

    setReceipt(file);
    setReceiptError(null);
  }

  async function confirmPayment() {
    if (!receipt) return;

    setSubmitError(null);
    setSubmitting(true);
    try {
      await onConfirm(method, receipt);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Payment submission failed",
      );
      console.error("Payment submission error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const paymentDetails = getPortalPaymentDetails(portal);

  return (
    <div className="min-w-0 space-y-4">
      <div className="min-w-0 space-y-4">
        {isRetry && (
          <p className="text-sm text-muted-foreground">
            Your request and payment are already recorded. Retrying will upload
            the receipt to the existing payment.
          </p>
        )}
        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Available Payment Channels
            </p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {PAYMENT_PORTALS.map(({ id, label, value, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={isRetry}
                  aria-pressed={portal === id}
                  onClick={() => choosePortal(id, value)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    portal === id
                      ? cn(TONES.brand.badge, "ring-1 ring-primary/20")
                      : "bg-background text-foreground hover:bg-muted/30 border border-border/60",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {paymentDetails && (
            <div className="rounded-xl border bg-card p-4 shadow-xs space-y-3 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2">
                  <Landmark className="size-4 text-primary" aria-hidden="true" />
                  <p className="text-sm font-bold tracking-tight text-foreground">
                    {paymentDetails.bankName} Official Settlement Channel
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <QrCode className="size-3" aria-hidden="true" />
                  QR Ph & InstaPay Verified
                </span>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex shrink-0 justify-center">
                  <button
                    type="button"
                    onClick={() => setEnlarged(true)}
                    className="group relative overflow-hidden rounded-lg border bg-white p-1.5 shadow-xs transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-zoom-in"
                    title="Click to enlarge or focus on QR code"
                    aria-label="Enlarge QR code image"
                  >
                    <img
                      src={paymentDetails.qrImagePath}
                      alt={`${paymentDetails.bankName} Official QR Ph Payment Code`}
                      className="size-36 object-contain rounded-sm"
                      loading="eager"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[11px] font-medium text-white shadow-xs">
                        <ZoomIn className="size-3.5" aria-hidden="true" />
                        Enlarge
                      </span>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[10px] font-medium text-white group-hover:hidden">
                      Click to enlarge
                    </div>
                  </button>
                </div>

                <div className="flex-1 space-y-2.5">
                  {/* Phone number only incorporated when GCash is selected */}
                  {paymentDetails.hasPhoneNumber && paymentDetails.accountNumber && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Registered GCash Mobile Number
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-lg font-bold tracking-tight text-foreground">
                          {paymentDetails.formattedNumber}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void copyMobileNumber(paymentDetails.accountNumber!)
                          }
                          className="h-8 gap-1.5 px-2.5 text-xs font-medium cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="size-3.5" aria-hidden="true" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <p>
                      <span className="font-medium text-foreground">Channel:</span>{" "}
                      {paymentDetails.bankName}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Payee:</span>{" "}
                      {paymentDetails.accountName}
                    </p>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {paymentDetails.notes}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Enlarged QR Code Lightbox Dialog */}
        <Dialog open={enlarged} onOpenChange={setEnlarged}>
          <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md p-4 sm:p-6 bg-card text-card-foreground">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <QrCode className="size-4.5 text-primary" aria-hidden="true" />
                {paymentDetails?.bankName} Payment QR Code
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center gap-3 pt-2">
              <div className="overflow-hidden rounded-xl border bg-white p-3 shadow-md max-w-full">
                <img
                  src={paymentDetails?.qrImagePath}
                  alt={`${paymentDetails?.bankName} Official QR Code`}
                  className="max-h-[60vh] max-w-full object-contain rounded-md"
                />
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Scan using your banking or e-wallet app supporting QR Ph / InstaPay.
              </p>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Transfers are processed externally via QR Ph / InstaPay. After sending payment, capture a screenshot of your transfer confirmation or transaction receipt and upload it below for office verification.
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{documentName}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Total document fee
            </p>
          </div>
          <p className="text-lg font-bold text-primary">{feeLabel}</p>
        </div>

        <div className="space-y-3">
          <p className="text-base font-semibold">Attach Payment Receipt</p>
          <PaymentReceiptAttachment
            id="online-payment-receipt"
            file={receipt}
            error={receiptError}
            onSelect={handleReceiptChange}
          />
        </div>

        {submitError && (
          <p className="text-sm text-destructive" role="alert">
            {submitError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={!receipt || submitting}
            onClick={() => void confirmPayment()}
          >
            {submitting
              ? "Submitting..."
              : isRetry || submitError
                ? "Retry Receipt Upload"
                : "I've Paid"}
            <Banknote className="ml-2 size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OnlinePayment;
