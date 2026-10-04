import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PaymentReceiptAttachment from "./PaymentReceiptAttachment";

interface OnlinePaymentProps {
  documentName: string;
  feeLabel: string;
  onConfirm: () => void | Promise<void>;
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

  function handleReceiptChange(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setReceipt(null);
      setReceiptError("Select an image or PDF receipt.");
      return;
    }

    setReceipt(file);
    setReceiptError(null);
  }

  async function confirmPayment() {
    if (!receipt) return;

    setSubmitting(true);
    try {
      await onConfirm();
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
          <p className="mt-1 text-muted-foreground">
            Document fee: {feeLabel}
          </p>
        </div>

        <section
          aria-label="Official QR code placeholder"
          className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 p-6 text-center"
        >
          <p className="font-medium">Official QR Code / Payment Information</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Payment information has not been provided yet. Please check with
            the school before transferring money.
          </p>
        </section>

        <p className="text-sm text-muted-foreground">
          Follow the official school payment instructions and transfer the
          amount shown above. Select “I've Paid” only after you have completed
          the transfer. The system cannot detect or verify the transfer
          automatically.
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
