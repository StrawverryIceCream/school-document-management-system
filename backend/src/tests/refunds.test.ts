import assert from "node:assert/strict";
import {
  canRequesterCancelRequest,
  canRequesterClaimOrUpdateRefund,
  canUserManageRefunds,
  shouldTriggerRefundOnTermination,
  validateRefundPayoutPreference,
  validateRefundReviewDecision,
} from "../lib/refunds.js";

console.log("Running refund workflow unit tests...");

// 1. canRequesterCancelRequest allows only pre-production statuses
assert.equal(canRequesterCancelRequest("pending"), true);
assert.equal(canRequesterCancelRequest("awaiting_payment"), true);
assert.equal(canRequesterCancelRequest("processing"), false);
assert.equal(canRequesterCancelRequest("on_hold"), false);
assert.equal(canRequesterCancelRequest("ready"), false);
assert.equal(canRequesterCancelRequest("claimed"), false);
assert.equal(canRequesterCancelRequest("rejected"), false);
assert.equal(canRequesterCancelRequest("cancelled"), false);

// 2. shouldTriggerRefundOnTermination triggers on cancellation or final rejection when paid
assert.equal(
  shouldTriggerRefundOnTermination({
    toStatus: "cancelled",
    resubmissionAllowed: false,
    activePaymentExists: true,
  }),
  true,
);
assert.equal(
  shouldTriggerRefundOnTermination({
    toStatus: "rejected",
    resubmissionAllowed: false,
    activePaymentExists: true,
  }),
  true,
);
assert.equal(
  shouldTriggerRefundOnTermination({
    toStatus: "rejected",
    resubmissionAllowed: true,
    activePaymentExists: true,
  }),
  false,
);
assert.equal(
  shouldTriggerRefundOnTermination({
    toStatus: "cancelled",
    resubmissionAllowed: false,
    activePaymentExists: false,
  }),
  false,
);
assert.equal(
  shouldTriggerRefundOnTermination({
    toStatus: "processing",
    resubmissionAllowed: false,
    activePaymentExists: true,
  }),
  false,
);

// 3. validateRefundPayoutPreference validates payout details based on payment & method
assert.deepEqual(
  validateRefundPayoutPreference({
    hasActivePayment: false,
    refundMethod: "e_wallet",
    refundAccountName: "",
    refundAccountNumber: "",
  }),
  { valid: true, details: null },
);

assert.deepEqual(
  validateRefundPayoutPreference({
    hasActivePayment: true,
  }),
  {
    valid: true,
    details: {
      refundMethod: "cash",
      refundAccountName: null,
      refundAccountNumber: null,
    },
  },
);

assert.equal(
  validateRefundPayoutPreference({
    hasActivePayment: true,
    refundMethod: "e_wallet",
    refundAccountName: "   ",
    refundAccountNumber: "09171234567",
  }).valid,
  false,
);

assert.equal(
  validateRefundPayoutPreference({
    hasActivePayment: true,
    refundMethod: "bank_transfer",
    refundAccountName: "Juan Dela Cruz",
    refundAccountNumber: "   ",
  }).valid,
  false,
);

assert.deepEqual(
  validateRefundPayoutPreference({
    hasActivePayment: true,
    refundMethod: "e_wallet",
    refundAccountName: " Juan Dela Cruz ",
    refundAccountNumber: " 09171234567 ",
  }),
  {
    valid: true,
    details: {
      refundMethod: "e_wallet",
      refundAccountName: "Juan Dela Cruz",
      refundAccountNumber: "09171234567",
    },
  },
);

assert.deepEqual(
  validateRefundPayoutPreference({
    hasActivePayment: true,
    refundMethod: "cash",
    refundAccountName: "Ignored",
    refundAccountNumber: "12345",
  }),
  {
    valid: true,
    details: {
      refundMethod: "cash",
      refundAccountName: null,
      refundAccountNumber: null,
    },
  },
);

assert.deepEqual(
  validateRefundPayoutPreference({
    hasActivePayment: true,
    refundMethod: "e_wallet",
    refundAccountName: "",
    refundAccountNumber: "",
    hasRefundQr: true,
  }),
  {
    valid: true,
    details: {
      refundMethod: "e_wallet",
      refundAccountName: null,
      refundAccountNumber: null,
    },
  },
);

assert.deepEqual(
  validateRefundPayoutPreference({
    hasActivePayment: true,
    refundMethod: "bank_transfer",
    refundAccountName: " Juan Dela Cruz ",
    refundAccountNumber: "",
    hasRefundQr: true,
  }),
  {
    valid: true,
    details: {
      refundMethod: "bank_transfer",
      refundAccountName: "Juan Dela Cruz",
      refundAccountNumber: null,
    },
  },
);

// 3b. canRequesterClaimOrUpdateRefund allows claiming/updating on terminated paid requests unless resolved
assert.equal(
  canRequesterClaimOrUpdateRefund({
    requestStatus: "cancelled",
    resubmissionAllowed: false,
    paymentStatus: "verified",
    refundStatus: null,
  }),
  true,
);
assert.equal(
  canRequesterClaimOrUpdateRefund({
    requestStatus: "rejected",
    resubmissionAllowed: false,
    paymentStatus: "pending",
    refundStatus: "pending",
  }),
  true,
);
assert.equal(
  canRequesterClaimOrUpdateRefund({
    requestStatus: "rejected",
    resubmissionAllowed: true,
    paymentStatus: "verified",
    refundStatus: null,
  }),
  false,
);
assert.equal(
  canRequesterClaimOrUpdateRefund({
    requestStatus: "cancelled",
    resubmissionAllowed: false,
    paymentStatus: "verified",
    refundStatus: "refunded",
  }),
  false,
);
assert.equal(
  canRequesterClaimOrUpdateRefund({
    requestStatus: "cancelled",
    resubmissionAllowed: false,
    paymentStatus: "rejected",
    refundStatus: "rejected",
  }),
  false,
);
assert.equal(
  canRequesterClaimOrUpdateRefund({
    requestStatus: "processing",
    resubmissionAllowed: false,
    paymentStatus: "verified",
    refundStatus: null,
  }),
  false,
);

// 4. canUserManageRefunds scopes financial review to Admin and Cashier's Office (CO)
assert.equal(canUserManageRefunds({ role: "admin" }), true);
assert.equal(
  canUserManageRefunds({
    role: "staff",
    officeRecord: { code: "CO", name: "Cashier's Office" },
  }),
  true,
);
assert.equal(
  canUserManageRefunds({
    role: "staff",
    officeRecord: { code: "CASHIER", name: "University Cashier" },
  }),
  true,
);
assert.equal(
  canUserManageRefunds({
    role: "staff",
    officeRecord: { code: "OUR", name: "Office of the University Registrar" },
  }),
  false,
);
assert.equal(canUserManageRefunds({ role: "student" }), false);
assert.equal(canUserManageRefunds(null), false);

// 5. validateRefundReviewDecision enforces pending state and required notes
assert.equal(
  validateRefundReviewDecision({
    currentPaymentStatus: "pending",
    currentRefundStatus: null,
    decision: "refunded",
    payoutReference: "GCASH-123",
  }).valid,
  false,
);

assert.equal(
  validateRefundReviewDecision({
    currentPaymentStatus: "verified",
    currentRefundStatus: "pending",
    decision: "refunded",
    payoutReference: "   ",
  }).valid,
  false,
);

assert.deepEqual(
  validateRefundReviewDecision({
    currentPaymentStatus: "pending",
    currentRefundStatus: "pending",
    decision: "refunded",
    payoutReference: " GCASH-9988 ",
  }),
  {
    valid: true,
    decision: "refunded",
    payoutReference: "GCASH-9988",
    rejectionReason: null,
  },
);

assert.equal(
  validateRefundReviewDecision({
    currentPaymentStatus: "pending",
    currentRefundStatus: "pending",
    decision: "rejected",
    rejectionReason: "",
  }).valid,
  false,
);

assert.deepEqual(
  validateRefundReviewDecision({
    currentPaymentStatus: "pending",
    currentRefundStatus: "pending",
    decision: "rejected",
    rejectionReason: " No transfer found in bank statement ",
  }),
  {
    valid: true,
    decision: "rejected",
    payoutReference: null,
    rejectionReason: "No transfer found in bank statement",
  },
);

console.log("All refund workflow unit tests passed!");
