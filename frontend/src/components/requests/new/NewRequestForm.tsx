import { useDocument } from "@/hooks/useDocument";
import type { FormDataValue } from "@/api/requests";
import type { Payment, RequiredFieldValues } from "@/types";
import type { PaymentMethod } from "@/api/payments";
import { createRequest } from "@/api/requests";
import { createPayment, uploadPaymentProof } from "@/api/payments";
import { useMyRequest } from "@/hooks/useMyRequest";
import { useRequestWizard } from "@/hooks/useRequestWizard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Headset, ShieldCheck } from "lucide-react";
import { formatPeso } from "@/lib/format";
import { TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import DocumentRequestForm from "./DocumentRequestForm";
import PaymentRequestSummary from "./PaymentRequestSummary";
import RequestWizardHeader from "./RequestWizardHeader";
import StudentBillingSummary from "./StudentBillingSummary";
import CashPayment from "@/components/requests/payments/CashPayment";
import OnlinePayment from "@/components/requests/payments/OnlinePayment";
import PaymentConfirmation from "@/components/requests/payments/PaymentConfirmation";
import PaymentRequired from "@/components/requests/payments/PaymentRequired";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PaymentStep = "form" | "method" | "confirmation";
type SettlementMethod = "online" | "cash";
type OnlinePaymentMethod = Exclude<PaymentMethod, "cash">;

function NewRequestForm() {
  const { id } = useParams<{ id?: string }>();
  const { document, documentLoading, documentError } = useDocument(id);
  const { refreshMyRequests } = useMyRequest();
  const { setCurrentStep } = useRequestWizard();
  const [step, setStep] = useState<PaymentStep>("form");
  const [formData, setFormData] = useState<Record<
    string,
    FormDataValue
  > | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<
    Pick<Payment, "id" | "receiptNumber"> | null
  >(null);
  const [settlementMethod, setSettlementMethod] =
    useState<SettlementMethod | null>(null);
  const [onlinePaymentMethod, setOnlinePaymentMethod] =
    useState<OnlinePaymentMethod>("e_wallet");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestSubmitError, setRequestSubmitError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setCurrentStep(step === "form" ? "details" : "payment");
  }, [setCurrentStep, step]);

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
    if (
      !document ||
      !formData ||
      !proofFile ||
      !settlementMethod ||
      !(Number(document.fee) > 0)
    ) {
      return;
    }

    let paymentToComplete = pendingPayment;
    if (!paymentToComplete) {
      const request = await createRequest({
        documentTypeId: String(document.id),
        formData,
      });

      const payment = await createPayment({
        requestId: String(request.id),
        method,
      });
      paymentToComplete = {
        id: payment.id,
        receiptNumber: payment.receiptNumber,
      };
      setPendingPayment(paymentToComplete);
    }

    await uploadPaymentProof(paymentToComplete.id, proofFile);
    setReceiptNumber(paymentToComplete.receiptNumber);
    setPendingPayment(null);
    setStep("confirmation");
    await refreshMyRequests();
  }

  async function submitFreeRequest() {
    if (
      !document ||
      !formData ||
      Number(document.fee) > 0 ||
      requestSubmitting
    ) {
      return;
    }

    setRequestSubmitting(true);
    setRequestSubmitError(null);
    try {
      await createRequest({
        documentTypeId: String(document.id),
        formData,
      });
    } catch (err) {
      setRequestSubmitError(
        err instanceof Error ? err.message : "Request submission failed",
      );
      setRequestSubmitting(false);
      return;
    }

    setReceiptNumber(null);
    setStep("confirmation");
    try {
      await refreshMyRequests();
    } catch (err) {
      setRequestSubmitError(
        err instanceof Error
          ? `Request submitted, but your request list could not be refreshed: ${err.message}`
          : "Request submitted, but your request list could not be refreshed.",
      );
    } finally {
      setRequestSubmitting(false);
    }
  }

  if (!id) {
    return <p className="p-6 text-destructive">No document specified.</p>;
  }

  if (documentLoading) {
    return <p className="p-6 text-muted-foreground">Loading document...</p>;
  }

  if (documentError) {
    return <p className="p-6 text-destructive">{documentError}</p>;
  }

  if (!document) {
    return <p className="p-6 text-muted-foreground">Document not found.</p>;
  }

  const feeLabel =
    Number.isFinite(Number(document.fee)) && Number(document.fee) > 0
      ? formatPeso(Number(document.fee))
      : "To be confirmed";
  const paymentRequired = Number(document.fee) > 0;

  if (step === "form") {
    return <DocumentRequestForm document={document} onSubmit={handleSubmit} />;
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col">
        <RequestWizardHeader />

        {step === "method" && (
          <>
            <div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                {paymentRequired
                  ? "Review, Payment & Verification"
                  : "Review & Submit Request"}
              </h1>
              <p className="mt-1 text-base text-muted-foreground">
                {paymentRequired
                  ? "Choose your preferred settlement method and review your request details."
                  : "Review your request details before submitting."}
              </p>
            </div>

            {paymentRequired && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted px-4 py-3 shadow-sm">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ShieldCheck className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">
                    Payment Verification by Registrar
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                    Upload your receipt after payment. Staff will verify it
                    before processing your request.
                  </p>
                </div>
                <span
                  className={cn(
                    "hidden rounded-full px-2.5 py-1.5 text-sm font-semibold sm:inline-flex",
                    TONES.sky.badge,
                  )}
                >
                  Staff review required
                </span>
              </div>
            )}
          </>
        )}

        <div
          className={
            step === "method"
              ? "mt-4 grid w-full items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)]"
              : "mx-auto mt-8 w-full max-w-2xl"
          }
        >
          {step === "method" && (
            <div className="min-w-0 space-y-3">
              {paymentRequired ? (
                <>
                  <PaymentRequired
                    method={settlementMethod}
                    onMethodChange={setSettlementMethod}
                    onlineContent={
                      <OnlinePayment
                        documentName={document.name}
                        feeLabel={feeLabel}
                        initialMethod={onlinePaymentMethod}
                        onMethodChange={setOnlinePaymentMethod}
                        onConfirm={(method, proofFile) =>
                          submitPayment(method, proofFile)
                        }
                        isRetry={pendingPayment !== null}
                      />
                    }
                    cashContent={
                      <CashPayment
                        documentName={document.name}
                        feeLabel={feeLabel}
                        onSubmitProof={(proofFile) =>
                          submitPayment("cash", proofFile)
                        }
                        isRetry={pendingPayment !== null}
                      />
                    }
                  />
                  <Card className="flex-row items-center gap-3 rounded-xl border-0 bg-muted p-3 shadow-none">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                      <Headset className="size-5 text-primary" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-base font-semibold">
                        Need assistance with your billing?
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        For fee or payment questions, contact the Registrar&apos;s
                        Office before submitting your receipt.
                      </p>
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="gap-4 rounded-xl border-0 p-4 shadow-sm sm:p-5">
                  <div>
                    <h2 className="text-lg font-semibold">
                      No payment required for this document.
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Continue to submit your request without payment details.
                    </p>
                  </div>
                  {requestSubmitError && (
                    <p role="alert" className="text-sm text-destructive">
                      {requestSubmitError}
                    </p>
                  )}
                  <Button
                    type="button"
                    disabled={requestSubmitting}
                    onClick={() => void submitFreeRequest()}
                  >
                    {requestSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </Card>
              )}
            </div>
          )}
          {step === "method" && (
            <div className="space-y-3">
              <StudentBillingSummary
                documentName={document.name}
                feeLabel={feeLabel}
                paymentRequired={paymentRequired}
              />
              <PaymentRequestSummary
                documentName={document.name}
                feeLabel={feeLabel}
                formData={formData ?? {}}
                paymentRequired={paymentRequired}
              />
            </div>
          )}
          {step === "confirmation" && (
            <PaymentConfirmation
              receiptNumber={receiptNumber}
              amount={document.fee}
              paymentRequired={paymentRequired}
              message={requestSubmitError}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default NewRequestForm;
