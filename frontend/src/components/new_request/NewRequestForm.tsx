import { useDocument } from "@/hooks/useDocument";
import type { FormDataValue } from "@/api/requests";
import type { RequiredFieldValues } from "@/types";
import type { PaymentMethod } from "@/api/payments";
import { createRequest } from "@/api/requests";
import { createPayment, uploadPaymentProof } from "@/api/payments";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import CashPayment from "./CashPayment";
import DocumentRequestForm from "./DocumentRequestForm";
import OnlinePayment from "./OnlinePayment";
import PaymentConfirmation from "./PaymentConfirmation";
import PaymentRequired from "./PaymentRequired";

type PaymentStep = "form" | "method" | "cash" | "online" | "confirmation";

function NewRequestForm() {
  const { id } = useParams<{ id?: string }>();
  const { document, loading, error } = useDocument(id);
  const [step, setStep] = useState<PaymentStep>("form");
  const [formData, setFormData] =
    useState<Record<string, FormDataValue> | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);

  async function handleSubmit(values: RequiredFieldValues) {
    if (!document) return;

    setFormData(
      Object.fromEntries(
        document.requiredFields.map((field) => [
          field.label,
          values[field.key],
        ]),
      ),
    );
    setStep("method");
  }

  async function submitPayment(method: PaymentMethod, proofFile?: File) {
    if (!document || !formData) return;

    try {
      // 1. Create the document request
      const request = await createRequest({
        documentTypeId: String(document.id),
        formData,
      });

      // 2. Create the payment record
      const payment = await createPayment({
        requestId: String(request.id),
        method,
      });

      setReceiptNumber(payment.receiptNumber);

      // 3. Upload proof if provided
      if (proofFile) {
        await uploadPaymentProof(payment.id, proofFile);
      }

      setStep("confirmation");
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit payment",
      );
    }
  }

  if (!id) {
    return <p className="p-6 text-destructive">No document specified.</p>;
  }

  if (loading) {
    return <p className="p-6 text-muted-foreground">Loading document...</p>;
  }

  if (error) {
    return <p className="p-6 text-destructive">{error}</p>;
  }

  if (!document) {
    return <p className="p-6 text-muted-foreground">Document not found.</p>;
  }

  const feeLabel =
    Number.isFinite(Number(document.fee)) && Number(document.fee) > 0
      ? `$${document.fee}`
      : "To be confirmed";

  if (step === "form") {
    return <DocumentRequestForm document={document} onSubmit={handleSubmit} />;
  }

  return (
    <div className="min-h-full overflow-y-auto p-6 sm:p-10">
      <div className="mx-auto max-w-2xl">
        {step === "method" && (
          <PaymentRequired
            documentName={document.name}
            feeLabel={feeLabel}
            onCash={() => setStep("cash")}
            onOnline={() => setStep("online")}
          />
        )}
        {step === "cash" && (
          <CashPayment
            documentName={document.name}
            feeLabel={feeLabel}
            onSubmitProof={(proofFile) => submitPayment("cash", proofFile)}
            onBack={() => setStep("method")}
          />
        )}
        {step === "online" && (
          <OnlinePayment
            documentName={document.name}
            feeLabel={feeLabel}
            onConfirm={(method, proofFile) => submitPayment(method, proofFile)}
            onBack={() => setStep("method")}
          />
        )}
        {step === "confirmation" && (
          <PaymentConfirmation
            receiptNumber={receiptNumber}
            amount={document.fee}
          />
        )}
      </div>
    </div>
  );
}

export default NewRequestForm;