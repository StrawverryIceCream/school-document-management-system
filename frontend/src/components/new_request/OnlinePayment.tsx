import { useState } from "react";
import {
  AlertCircle,
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PaymentMethod } from "@/api/payments";
import PaymentReceiptAttachment from "./PaymentReceiptAttachment";
import { cn } from "@/lib/utils";
import { TONES } from "@/lib/tones";
import { validatePaymentProof } from "@/lib/payment-proof";

type OnlinePaymentMethod = Exclude<PaymentMethod, "cash">;
const DEFAULT_PAYMENT_METHOD: OnlinePaymentMethod = "bank_transfer";

const PAYMENT_PORTALS = [
  { id: "gcash", label: "GCash", value: "e_wallet", icon: Wallet },
  { id: "maya", label: "Maya", value: "e_wallet", icon: Smartphone },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    value: "bank_transfer",
    icon: Landmark,
  },
  { id: "card", label: "Card", value: "card", icon: CreditCard },
] as const;

type PaymentPortal = (typeof PAYMENT_PORTALS)[number]["id"];

function getInitialPortal(method: OnlinePaymentMethod): PaymentPortal {
  if (method === "bank_transfer") return "bank_transfer";
  if (method === "card") return "card";
  return "gcash";
}

interface OnlinePaymentProps {
  documentName: string;
  feeLabel: string;
  isRetry: boolean;
  initialMethod?: OnlinePaymentMethod;
  onMethodChange: (method: OnlinePaymentMethod) => void;
  onConfirm: (method: PaymentMethod, proofFile: File) => void | Promise<void>;
  onBack: () => void;
}

function OnlinePayment({
  documentName,
  feeLabel,
  isRetry,
  initialMethod = DEFAULT_PAYMENT_METHOD,
  onMethodChange,
  onConfirm,
  onBack,
}: OnlinePaymentProps) {
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [method, setMethod] = useState<OnlinePaymentMethod>(initialMethod);
  const [portal, setPortal] = useState<PaymentPortal>(
    getInitialPortal(initialMethod),
  );

  function choosePortal(
    portalId: PaymentPortal,
    paymentMethod: OnlinePaymentMethod,
  ) {
    setPortal(portalId);
    setMethod(paymentMethod);
    onMethodChange(paymentMethod);
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

  return (
    <Card className="gap-4 rounded-2xl border-0 p-4 shadow-sm sm:p-6">
      <CardHeader className="flex-row items-start justify-between gap-3 p-0">
        <div>
          <CardTitle className="text-lg sm:text-xl">Online Payment</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Review payment options and upload your receipt for verification.
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-sm font-semibold",
            TONES.sky.badge,
          )}
        >
          <Zap className="size-3.5" aria-hidden="true" />
          Online
        </span>
      </CardHeader>
      <CardContent className="space-y-5 p-0">
        {isRetry && (
          <p className="text-sm text-muted-foreground">
            Your request and payment are already recorded. Retrying will upload
            the receipt to the existing payment.
          </p>
        )}
        <section className="space-y-4 rounded-xl bg-muted p-4 sm:p-5">
          <div>
            <p className="text-base font-semibold">Online Digital Payment</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Payment receipt authorization and clearance are completed by
              staff; this portal does not verify payment instantly.
            </p>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Available Payment Methods
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PAYMENT_PORTALS.map(({ id, label, value, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  disabled={isRetry}
                  aria-pressed={portal === id}
                  onClick={() => choosePortal(id, value)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    portal === id
                      ? cn(TONES.brand.badge, "ring-1 ring-primary/20")
                      : "bg-muted/50 text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-semibold">
                Registered E-Wallet Mobile Number
              </p>
              <p className={cn("text-sm font-medium", TONES.brand.value)}>
                Transaction Fee: Check with provider
              </p>
            </div>
            <div className="mt-2 flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5">
              <span className="border-r pr-3 text-sm font-medium text-muted-foreground">
                +63
              </span>
              <span className="flex-1 text-sm text-muted-foreground">
                No mobile number on file
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The app does not store a registered wallet number. Check the
              official portal directly before sending payment.
            </p>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-3.5">
          <AlertCircle
            className="mt-0.5 size-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Official payment instructions or a school QR code have not been
            configured here. Transfers are not detected automatically; only
            submit proof after paying through a verified university portal.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{documentName}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Total document fee
              </p>
            </div>
            <p className="text-lg font-bold text-primary">{feeLabel}</p>
          </div>
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
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={submitting || isRetry}
          >
            Back to payment methods
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default OnlinePayment;
