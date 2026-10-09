import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { PaymentMethod } from "@/api/payments";
import PaymentReceiptAttachment from "./PaymentReceiptAttachment";

const DEFAULT_PAYMENT_METHOD: PaymentMethod = "bank_transfer";

const RECEIPT_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const RECEIPT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "e_wallet", label: "E-Wallet (GCash, PayMaya)" },
  { value: "card", label: "Credit/Debit Card" },
];

// Mirrors the backend upload filter so users get feedback before the request fails
function validateReceipt(file: File): string | null {
  if (!(RECEIPT_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return "Select a JPG, PNG, or WebP image.";
  }
  if (file.size > RECEIPT_MAX_SIZE_BYTES) {
    return `Receipt must be ${RECEIPT_MAX_SIZE_BYTES / (1024 * 1024)} MB or smaller.`;
  }
  return null;
}

interface OnlinePaymentProps {
  documentName: string;
  feeLabel: string;
  onConfirm: (method: PaymentMethod, proofFile: File) => void | Promise<void>;
  onBack: () => void;
}

function OnlinePayment({
  documentName,
  feeLabel,
  onConfirm,
  onBack,
}: OnlinePaymentProps) {
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>(DEFAULT_PAYMENT_METHOD);

  function handleReceiptChange(file: File | undefined) {
    setSubmitError(null);

    // Browsers clear the input when the picker is cancelled; keep state in sync
    if (!file) {
      setReceipt(null);
      setReceiptError(null);
      return;
    }

    const validationError = validateReceipt(file);
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
    <Card>
      <CardHeader>
        <CardTitle>Online Payment</CardTitle>
        <CardDescription>
          Review the payment details and instructions below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-lg border p-4 text-sm">
          <p className="font-medium">{documentName}</p>
          <p className="mt-1 text-muted-foreground">Document fee: {feeLabel}</p>
        </div>

        <Field>
          <FieldLabel htmlFor="payment-method">Payment Method</FieldLabel>
          <Select
            value={method}
            onValueChange={(value) => setMethod(value as PaymentMethod)}
          >
            <SelectTrigger id="payment-method">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_METHOD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <section
          aria-label="Official QR code placeholder"
          className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 text-center"
        >
          <p className="font-medium">Official QR Code / Payment Information</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Payment information has not been provided yet. Please check with the
            school before transferring money.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Follow the official school payment instructions and transfer the
          amount shown above. Select &ldquo;I&apos;ve Paid&rdquo; only after you
          have completed the transfer. The system cannot detect or verify the
          transfer automatically.
        </p>

        <div className="space-y-3">
          <p className="text-sm font-medium">Attach Payment Receipt</p>
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
            {submitting ? "Submitting..." : "I've Paid"}
          </Button>
          <Button type="button" variant="outline" onClick={onBack}>
            Back to payment methods
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default OnlinePayment;
