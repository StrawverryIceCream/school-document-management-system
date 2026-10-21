import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";

export interface FormattedRequestCardData {
  referenceNumber: string;
  officeName: string;
  isPaid: boolean;
  paymentStatusText: string;
  hasVerifiedPayment: boolean;
  amountNumber: number;
}

export function formatRequestCardData(
  request: MyRequestWithDocumentName,
): FormattedRequestCardData {
  const referenceNumber =
    request.referenceNumber && request.referenceNumber.trim()
      ? request.referenceNumber.trim()
      : `#${request.id.slice(0, 8)}`;

  const officeName =
    request.documentType?.officeRecord?.name ||
    (request.documentType?.office === "hr"
      ? "Human Resources Management Office"
      : "Office of the University Registrar");

  const amountNumber = Number(request.amountDue) || 0;
  const hasVerifiedPayment = Boolean(
    request.payments?.some((p) => p.status === "verified"),
  );

  let paymentStatusText = "Free Document";
  if (amountNumber > 0) {
    if (hasVerifiedPayment) {
      paymentStatusText = `Paid (₱${amountNumber.toFixed(2)})`;
    } else if (request.payments && request.payments.length > 0) {
      paymentStatusText = `₱${amountNumber.toFixed(2)} • Verification Pending`;
    } else {
      paymentStatusText = `₱${amountNumber.toFixed(2)} • Awaiting Payment`;
    }
  }

  return {
    referenceNumber,
    officeName,
    isPaid: hasVerifiedPayment,
    paymentStatusText,
    hasVerifiedPayment,
    amountNumber,
  };
}
