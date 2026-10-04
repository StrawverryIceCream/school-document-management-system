import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PaymentProofProps {
  onSubmit: (proof: File) => void | Promise<void>;
}

function PaymentProof({ onSubmit }: PaymentProofProps) {
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
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm hover:bg-muted">
          <span className="font-medium">Take Photo</span>
          <span className="text-muted-foreground">
            Use your device camera if available.
          </span>
          <input
            className="sr-only"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(event) => selectProof(event.target.files?.[0])}
          />
        </label>
        <label className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm hover:bg-muted">
          <span className="font-medium">Attach Receipt</span>
          <span className="text-muted-foreground">
            Choose an image or PDF.
          </span>
          <input
            className="sr-only"
            type="file"
            accept="image/*,.pdf"
            onChange={(event) => selectProof(event.target.files?.[0])}
          />
        </label>
      </div>

      {proof && (
        <p className="break-all text-sm text-muted-foreground">
          Selected proof: {proof.name}
        </p>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}

      <p className="text-sm text-muted-foreground">
        Proof is only selected in this browser. The current system does not
        upload or save payment attachments.
      </p>
      <Button
        type="button"
        disabled={!proof || submitting}
        onClick={() => void submitProof()}
      >
        {submitting ? "Submitting..." : "Submit Proof of Payment"}
      </Button>
    </div>
  );
}

export default PaymentProof;
