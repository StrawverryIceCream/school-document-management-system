import type { DocumentRequestWithRelations, Payment } from "@/types";

export interface OfficialReceiptData {
  receiptNumber: string;
  transactionReference: string;
  requestReferenceNumber: string;
  documentTitle: string;
  copies: number;
  purpose: string;
  amountPaid: number;
  amountPaidFormatted: string;
  paymentMethod: string;
  paymentMethodLabel: string;
  payerName: string;
  studentId: string;
  verifyingOfficer: string;
  verifiedAt: string;
  submittedAt: string;
  status: string;
}

export function formatPaymentMethodLabel(method: string): string {
  switch (method) {
    case "e_wallet":
      return "E-Wallet";
    case "bank_transfer":
      return "Bank Transfer";
    case "card":
      return "Credit / Debit Card";
    case "cash":
      return "Cash Counter";
    default:
      return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export function hasOfficialReceipt(
  request: Partial<DocumentRequestWithRelations> | null | undefined,
): boolean {
  if (!request || !request.payments || !Array.isArray(request.payments)) {
    return false;
  }
  return request.payments.some((p) => p.status === "verified");
}

export function getVerifiedPayment(
  request: Partial<DocumentRequestWithRelations> | null | undefined,
): Payment | null {
  if (!request || !request.payments || !Array.isArray(request.payments)) {
    return null;
  }
  return request.payments.find((p) => p.status === "verified") ?? null;
}

export function extractOfficialReceiptData(
  request: Partial<DocumentRequestWithRelations>,
): OfficialReceiptData | null {
  const verifiedPayment = getVerifiedPayment(request);
  if (!verifiedPayment) {
    return null;
  }

  const receiptNumber =
    verifiedPayment.receiptNumber || `OR-${verifiedPayment.id}`;

  const amount = Number(verifiedPayment.amount || request.amountDue || 0);
  const amountPaidFormatted = `₱${amount.toFixed(2)}`;

  const studentId =
    request.user?.studentId ||
    (typeof request.formData?.studentId === "string"
      ? request.formData.studentId
      : "") ||
    "—";

  const payerName =
    request.user?.fullName ||
    (studentId !== "—" ? studentId : "Student Requester");

  const verifyingOfficer =
    verifiedPayment.reviewer?.fullName ||
    "University Cashier & Verification Unit";

  return {
    receiptNumber,
    transactionReference:
      verifiedPayment.referenceNumber ||
      request.referenceNumber ||
      verifiedPayment.id,
    requestReferenceNumber: request.referenceNumber || `REQ-${request.id}`,
    documentTitle:
      request.documentTypeName ||
      request.documentType?.name ||
      "Document Credential",
    copies: request.copies || 1,
    purpose: request.purpose || "Official Record Endorsement",
    amountPaid: amount,
    amountPaidFormatted,
    paymentMethod: verifiedPayment.method,
    paymentMethodLabel: formatPaymentMethodLabel(verifiedPayment.method),
    payerName,
    studentId,
    verifyingOfficer,
    verifiedAt: verifiedPayment.reviewedAt || verifiedPayment.submittedAt,
    submittedAt: verifiedPayment.submittedAt,
    status: verifiedPayment.status,
  };
}
