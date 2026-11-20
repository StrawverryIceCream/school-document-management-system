export const REFUND_STATUSES = ["pending", "refunded", "rejected"] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const REFUND_METHODS = ["e_wallet", "bank_transfer", "cash"] as const;
export type RefundMethod = (typeof REFUND_METHODS)[number];

const REQUESTER_CANCELLABLE_STATUSES = new Set([
  "pending",
  "awaiting_payment",
]);
const CASHIER_OFFICE_CODES = new Set(["CO", "CASHIER"]);
const MAX_REFUND_FIELD_LENGTH = 200;
const MAX_REFUND_REASON_LENGTH = 1000;

export interface RefundPayoutDetails {
  refundMethod: RefundMethod;
  refundAccountName: string | null;
  refundAccountNumber: string | null;
}

export type RefundPayoutValidationResult =
  | { valid: true; details: RefundPayoutDetails | null }
  | { valid: false; error: string };

export type RefundReviewValidationResult =
  | {
      valid: true;
      decision: "refunded" | "rejected";
      payoutReference: string | null;
      rejectionReason: string | null;
    }
  | { valid: false; error: string };

/** Returns true when a requester may self-cancel before production starts. */
export function canRequesterCancelRequest(status: string): boolean {
  return REQUESTER_CANCELLABLE_STATUSES.has(status);
}

/** Returns true when terminating a paid request must queue a manual refund. */
export function shouldTriggerRefundOnTermination(params: {
  toStatus: string;
  resubmissionAllowed: boolean;
  activePaymentExists: boolean;
}): boolean {
  if (!params.activePaymentExists) return false;
  if (params.toStatus === "cancelled") return true;
  return params.toStatus === "rejected" && !params.resubmissionAllowed;
}

/** Returns true when a requester may claim or update refund details on a terminated paid request. */
export function canRequesterClaimOrUpdateRefund(params: {
  requestStatus: string;
  resubmissionAllowed: boolean;
  paymentStatus: string;
  refundStatus: string | null | undefined;
}): boolean {
  const isTerminatedEligible =
    params.requestStatus === "cancelled" ||
    (params.requestStatus === "rejected" && !params.resubmissionAllowed);
  if (!isTerminatedEligible) return false;

  if (params.paymentStatus !== "pending" && params.paymentStatus !== "verified") {
    return false;
  }

  return (
    params.refundStatus === null ||
    params.refundStatus === undefined ||
    params.refundStatus === "pending"
  );
}

/** Validates requester payout channel and account info for paid cancellations. */
export function validateRefundPayoutPreference(params: {
  hasActivePayment: boolean;
  refundMethod?: unknown;
  refundAccountName?: unknown;
  refundAccountNumber?: unknown;
  hasRefundQr?: boolean;
}): RefundPayoutValidationResult {
  if (!params.hasActivePayment) {
    return { valid: true, details: null };
  }

  const rawMethod =
    params.refundMethod === undefined ||
    params.refundMethod === null ||
    params.refundMethod === ""
      ? "cash"
      : params.refundMethod;

  if (
    typeof rawMethod !== "string" ||
    !(REFUND_METHODS as readonly string[]).includes(rawMethod)
  ) {
    return {
      valid: false,
      error: `refundMethod must be one of: ${REFUND_METHODS.join(", ")}`,
    };
  }

  const method = rawMethod as RefundMethod;
  if (method === "cash") {
    return {
      valid: true,
      details: {
        refundMethod: "cash",
        refundAccountName: null,
        refundAccountNumber: null,
      },
    };
  }

  const accountName =
    typeof params.refundAccountName === "string"
      ? params.refundAccountName.trim()
      : "";
  const accountNumber =
    typeof params.refundAccountNumber === "string"
      ? params.refundAccountNumber.trim()
      : "";

  if (!params.hasRefundQr && (!accountName || !accountNumber)) {
    return {
      valid: false,
      error:
        "Account holder name and account/mobile number (or a receiving QR code) are required for e-wallet or bank transfer refunds",
    };
  }

  if (
    accountName.length > MAX_REFUND_FIELD_LENGTH ||
    accountNumber.length > MAX_REFUND_FIELD_LENGTH
  ) {
    return {
      valid: false,
      error: `Refund account details must be at most ${MAX_REFUND_FIELD_LENGTH} characters`,
    };
  }

  return {
    valid: true,
    details: {
      refundMethod: method,
      refundAccountName: accountName || null,
      refundAccountNumber: accountNumber || null,
    },
  };
}

/** Authorizes only Admins and Cashier's Office (CO) staff to review payments/refunds. */
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
  if (CASHIER_OFFICE_CODES.has(code)) return true;

  const name = user.officeRecord?.name?.trim().toLowerCase() ?? "";
  return name.includes("cashier");
}

/** Validates a Cashier decision to disburse or deny a pending refund request. */
export function validateRefundReviewDecision(params: {
  currentPaymentStatus: string;
  currentRefundStatus: string | null | undefined;
  decision: unknown;
  payoutReference?: unknown;
  rejectionReason?: unknown;
}): RefundReviewValidationResult {
  if (params.currentRefundStatus !== "pending") {
    return {
      valid: false,
      error: "This payment does not have a pending refund request",
    };
  }

  if (params.currentPaymentStatus === "rejected") {
    return {
      valid: false,
      error: "Rejected payments are not eligible for refund",
    };
  }

  if (params.decision === "refunded") {
    const payoutReference =
      typeof params.payoutReference === "string"
        ? params.payoutReference.trim()
        : "";
    if (!payoutReference) {
      return {
        valid: false,
        error: "Payout reference or voucher number is required to complete a refund",
      };
    }
    if (payoutReference.length > MAX_REFUND_FIELD_LENGTH) {
      return {
        valid: false,
        error: `Payout reference must be at most ${MAX_REFUND_FIELD_LENGTH} characters`,
      };
    }
    return {
      valid: true,
      decision: "refunded",
      payoutReference,
      rejectionReason: null,
    };
  }

  if (params.decision === "rejected") {
    const rejectionReason =
      typeof params.rejectionReason === "string"
        ? params.rejectionReason.trim()
        : "";
    if (!rejectionReason) {
      return {
        valid: false,
        error: "A reason is required when denying a refund request",
      };
    }
    if (rejectionReason.length > MAX_REFUND_REASON_LENGTH) {
      return {
        valid: false,
        error: `Rejection reason must be at most ${MAX_REFUND_REASON_LENGTH} characters`,
      };
    }
    return {
      valid: true,
      decision: "rejected",
      payoutReference: null,
      rejectionReason,
    };
  }

  return {
    valid: false,
    error: "decision must be either 'refunded' or 'rejected'",
  };
}
