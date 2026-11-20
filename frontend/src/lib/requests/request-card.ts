import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import type { Payment, RefundMethod, RefundStatus } from "@/types";

export interface FormattedRequestCardData {
  referenceNumber: string;
  officeName: string;
  isPaid: boolean;
  paymentStatusText: string;
  hasVerifiedPayment: boolean;
  amountNumber: number;
  canCancel: boolean;
  canClaimRefund: boolean;
  canUpdateRefund: boolean;
  hasActivePayment: boolean;
  activePayment: Payment | null;
  refundStatus: RefundStatus | null;
}

const CANCELLABLE_STATUSES = new Set(["pending", "awaiting_payment"]);

export function formatRefundMethodLabel(method: RefundMethod | string): string {
  switch (method) {
    case "e_wallet":
      return "E-Wallet (GCash / Maya)";
    case "bank_transfer":
      return "Bank Transfer";
    case "cash":
      return "Cash Counter Pickup";
    default:
      return method.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

/** Authorizes only Admins and Cashier's Office (CO) staff to manage payments and refunds. */
export function canUserManageRefunds(
  user:
    | {
        role?: string | null;
        officeRecord?: { code?: string | null; name?: string | null } | null;
      }
    | null
    | undefined,
): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role !== "staff") return false;

  const code = user.officeRecord?.code?.trim().toUpperCase() ?? "";
  if (code === "CO" || code === "CASHIER") return true;

  const name = user.officeRecord?.name?.trim().toLowerCase() ?? "";
  return name.includes("cashier");
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

  const payments = request.payments ?? [];
  const verifiedPayment =
    payments.find((p) => p.status === "verified") ?? null;
  const pendingPayment =
    payments.find((p) => p.status === "pending") ?? null;
  const activePayment = verifiedPayment ?? pendingPayment;
  const refundPayment =
    activePayment ?? payments.find((p) => p.refundStatus != null) ?? null;

  const amountNumber = Number(request.amountDue) || 0;
  const hasVerifiedPayment = Boolean(verifiedPayment);
  const refundStatus = refundPayment?.refundStatus ?? null;
  const isTerminatedForRefund =
    request.status === "cancelled" ||
    (request.status === "rejected" && !request.resubmissionAllowed);
  const canClaimRefund =
    isTerminatedForRefund && activePayment !== null && !refundStatus;
  const canUpdateRefund =
    isTerminatedForRefund &&
    activePayment !== null &&
    refundStatus === "pending";

  let paymentStatusText = "Free Document";
  if (amountNumber > 0) {
    if (refundStatus === "refunded") {
      paymentStatusText = `Refunded (₱${amountNumber.toFixed(2)})`;
    } else if (refundStatus === "pending") {
      paymentStatusText =
        refundPayment?.status === "pending"
          ? `₱${amountNumber.toFixed(2)} • Refund Pending Verification`
          : `₱${amountNumber.toFixed(2)} • Refund Pending Payout`;
    } else if (refundStatus === "rejected") {
      paymentStatusText = "Refund Denied";
    } else if (canClaimRefund) {
      paymentStatusText = `₱${amountNumber.toFixed(2)} • Refund Available to Claim`;
    } else if (hasVerifiedPayment) {
      paymentStatusText = `Paid (₱${amountNumber.toFixed(2)})`;
    } else if (payments.length > 0) {
      paymentStatusText = `₱${amountNumber.toFixed(2)} • Verification Pending`;
    } else {
      paymentStatusText = `₱${amountNumber.toFixed(2)} • Awaiting Payment`;
    }
  }

  return {
    referenceNumber,
    officeName,
    isPaid: Boolean(verifiedPayment && verifiedPayment.refundStatus !== "refunded"),
    paymentStatusText,
    hasVerifiedPayment,
    amountNumber,
    canCancel: CANCELLABLE_STATUSES.has(request.status),
    canClaimRefund,
    canUpdateRefund,
    hasActivePayment: activePayment !== null,
    activePayment: refundPayment,
    refundStatus,
  };
}
