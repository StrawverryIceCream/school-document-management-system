import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  PAYMENT_PROOF_MAX_SIZE_LABEL,
  validatePaymentProof,
} from "@/lib/payment-proof";
import PaymentReceiptAttachment from "./PaymentReceiptAttachment";

interface PaymentProofProps {
  isRetry: boolean;
  onSubmit: (proof: File) => void | Promise<void>;
}

function PaymentProof({ isRetry, onSubmit }: PaymentProofProps) {
  const [proof, setProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function selectProof(file: File | undefined) {
    if (!file) return;
    const validationError = validatePaymentProof(file);
    if (validationError) {
      setError(validationError);
      setSubmitError(null);
      setProof(null);
      return;
    }

    setError(null);
    setSubmitError(null);
    setProof(file);
  }

  async function submitProof() {
    if (!proof) return;
    setSubmitting(true);
    try {
      await onSubmit(proof);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Payment submission failed",
      );
      console.error("Cash payment submission error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <PaymentReceiptAttachment
        id="cash-payment-receipt"
        file={proof}
        error={error}
        onSelect={selectProof}
      />

      <p className="text-sm text-muted-foreground">
        Upload a JPG, PNG, WebP, or AVIF receipt image up to{" "}
        {PAYMENT_PROOF_MAX_SIZE_LABEL} for staff verification.
      </p>
      {isRetry && (
        <p className="text-sm text-muted-foreground">
          Your request and payment are already recorded. Retrying will upload
          the receipt to the existing payment.
        </p>
      )}
      {submitError && (
        <p role="alert" className="text-sm text-destructive">
          {submitError}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!proof || submitting}
          onClick={() => void submitProof()}
        >
          {submitting
            ? "Submitting..."
            : isRetry || submitError
              ? "Retry Receipt Upload"
              : "Submit Proof of Payment"}
        </Button>
      </div>
    </div>
  );
}

export default PaymentProof;
