import { useDocument } from "@/hooks/useDocument";
import type { FormDataValue } from "@/api/requests";
import type { RequiredFieldValues } from "@/types";
import { createRequest } from "@/api/requests";
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

  async function submitPaymentForVerification() {
    if (!document || !formData) return;

    try {
      await createRequest({
        documentTypeId: String(document.id),
        formData,
      });
      setStep("confirmation");
    } catch (submitError) {
      toast.error(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit request",
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
            onSubmitProof={submitPaymentForVerification}
            onBack={() => setStep("method")}
          />
        )}
        {step === "online" && (
          <OnlinePayment
            documentName={document.name}
            feeLabel={feeLabel}
            onConfirm={submitPaymentForVerification}
            onBack={() => setStep("method")}
          />
        )}
        {step === "confirmation" && <PaymentConfirmation />}
      </div>
    </div>
  );
}

export default NewRequestForm