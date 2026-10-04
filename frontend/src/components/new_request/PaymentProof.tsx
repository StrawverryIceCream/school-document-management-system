import { useState } from "react";
import { Button } from "@/components/ui/button";
import PaymentReceiptAttachment from "./PaymentReceiptAttachment";

interface PaymentProofProps {
  onSubmit: (proof: File) => void | Promise<void>;
  onBack: () => void;
}

function PaymentProof({ onSubmit, onBack }: PaymentProofProps) {
  const [proof, setProof] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function selectProof(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Choose an image or PDF proof of payment.");
      return;
    }

    setError(null);
    setProof(file);
  }

  async function submitProof() {
    if (!proof) return;
    setSubmitting(true);
    try {
      await onSubmit(proof);
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
        Proof is only selected in this browser. The current system does not
        upload or save payment attachments.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={!proof || submitting}
          onClick={() => void submitProof()}
        >
          {submitting ? "Submitting..." : "Submit Proof of Payment"}
        </Button>
        <Button type="button" variant="outline" onClick={onBack}>
          Back to payment methods
        </Button>
      </div>
    </div>
  );
}

export default PaymentProof;
