import assert from "node:assert/strict";
import {
  canUserManageRefunds,
  formatRequestCardData,
} from "../lib/requests/request-card";
import { normalizeRequestRow } from "../lib/requests/requests";
import {
  buildSectorWorkloadData,
  buildStatsFromRequests,
} from "../lib/dashboard/dashboard";
import { extractOfficialReceiptData } from "../lib/payments/official-receipt";
import type { MyRequestWithDocumentName } from "../context/MyRequestContext";
import type { DocumentRequestWithRelations, Payment } from "../types";

function makeBaseRequest(
  overrides: Partial<MyRequestWithDocumentName> = {},
): MyRequestWithDocumentName {
  return {
    id: "req-1",
    referenceNumber: "REQ-2026-000101",
    userId: "user-1",
    documentTypeId: "doc-1",
    documentTypeCode: "TOR-UG",
    documentTypeName: "Transcript of Records",
    documentName: "Transcript of Records",
    amountDue: "100.00",
    turnaroundDays: 3,
    copies: 1,
    purpose: "Scholarship",
    formData: {},
    status: "pending",
    windowId: null,
    assignedTo: null,
    processedAt: null,
    readyAt: null,
    releaseDate: null,
    releasePdfUrl: null,
    claimedAt: null,
    claimedBy: null,
    releasedBy: null,
    cancelledAt: null,
    cancellationReason: null,
    internalNotes: null,
    remarks: null,
    createdAt: "2026-11-20T08:00:00.000Z",
    updatedAt: "2026-11-20T08:00:00.000Z",
    payments: [],
    ...overrides,
  };
}

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: "pay-1",
    requestId: "req-1",
    amount: "100.00",
    method: "e_wallet",
    referenceNumber: "GCASH-1234",
    paymentProofUrl: "https://example.com/proof.jpg",
    status: "pending",
    rejectionReason: null,
    submittedAt: "2026-11-20T08:05:00.000Z",
    reviewedBy: null,
    reviewedAt: null,
    receiptNumber: "RCP-20261120-ABCD",
    createdAt: "2026-11-20T08:05:00.000Z",
    updatedAt: "2026-11-20T08:05:00.000Z",
    ...overrides,
  };
}

console.log("Running frontend refund workflow unit tests...");

// 1. formatRequestCardData refund statuses & cancellation eligibility
const refundedCard = formatRequestCardData(
  makeBaseRequest({
    status: "cancelled",
    payments: [
      makePayment({
        status: "verified",
        refundStatus: "refunded",
        refundPayoutReference: "GCASH-OUT-7788",
      } as Partial<Payment>),
    ],
  }),
);
assert.equal(refundedCard.paymentStatusText, "Refunded (₱100.00)");
assert.equal(refundedCard.canCancel, false);

const pendingVerifyRefundCard = formatRequestCardData(
  makeBaseRequest({
    status: "cancelled",
    payments: [
      makePayment({
        status: "pending",
        refundStatus: "pending",
      } as Partial<Payment>),
    ],
  }),
);
assert.equal(
  pendingVerifyRefundCard.paymentStatusText,
  "₱100.00 • Refund Pending Verification",
);

const pendingPayoutRefundCard = formatRequestCardData(
  makeBaseRequest({
    status: "cancelled",
    payments: [
      makePayment({
        status: "verified",
        refundStatus: "pending",
      } as Partial<Payment>),
    ],
  }),
);
assert.equal(
  pendingPayoutRefundCard.paymentStatusText,
  "₱100.00 • Refund Pending Payout",
);

const deniedRefundCard = formatRequestCardData(
  makeBaseRequest({
    status: "cancelled",
    payments: [
      makePayment({
        status: "rejected",
        refundStatus: "rejected",
      } as Partial<Payment>),
    ],
  }),
);
assert.equal(deniedRefundCard.paymentStatusText, "Refund Denied");

// canCancel is true only for pending and awaiting_payment
assert.equal(formatRequestCardData(makeBaseRequest({ status: "pending" })).canCancel, true);
assert.equal(formatRequestCardData(makeBaseRequest({ status: "awaiting_payment" })).canCancel, true);
assert.equal(formatRequestCardData(makeBaseRequest({ status: "processing" })).canCancel, false);
assert.equal(formatRequestCardData(makeBaseRequest({ status: "ready" })).canCancel, false);
assert.equal(formatRequestCardData(makeBaseRequest({ status: "claimed" })).canCancel, false);
assert.equal(formatRequestCardData(makeBaseRequest({ status: "rejected" })).canCancel, false);
assert.equal(formatRequestCardData(makeBaseRequest({ status: "cancelled" })).canCancel, false);

// 2. extractOfficialReceiptData marks refunded receipts
const receiptReq: Partial<DocumentRequestWithRelations> = {
  id: "req-1",
  referenceNumber: "REQ-2026-000101",
  documentTypeName: "Transcript of Records",
  amountDue: "100.00",
  copies: 1,
  purpose: "Scholarship",
  payments: [
    makePayment({
      status: "verified",
      receiptNumber: "RCP-20261120-ABCD",
      refundStatus: "refunded",
      refundPayoutReference: "GCASH-OUT-7788",
    } as Partial<Payment>),
  ],
};
const receiptData = extractOfficialReceiptData(receiptReq);
assert.ok(receiptData, "Official receipt data must exist");
assert.equal((receiptData as { isRefunded?: boolean }).isRefunded, true);
assert.equal(
  (receiptData as { refundPayoutReference?: string | null }).refundPayoutReference,
  "GCASH-OUT-7788",
);

// 3. canUserManageRefunds authorizes admin and CO staff only
assert.equal(canUserManageRefunds({ role: "admin" }), true);
assert.equal(
  canUserManageRefunds({
    role: "staff",
    officeRecord: { id: "co-1", code: "CO", name: "Cashier's Office" },
  }),
  true,
);
assert.equal(
  canUserManageRefunds({
    role: "staff",
    officeRecord: { id: "our-1", code: "OUR", name: "Office of the University Registrar" },
  }),
  false,
);
assert.equal(canUserManageRefunds({ role: "student" }), false);
assert.equal(canUserManageRefunds(null), false);

// 4. Staff-cancelled paid request exposes Claim Refund button, pending refund exposes Update button
const staffCancelledClaimable = formatRequestCardData(
  makeBaseRequest({
    status: "cancelled",
    payments: [makePayment({ status: "verified", refundStatus: null })],
  }),
) as ReturnType<typeof formatRequestCardData> & {
  canClaimRefund?: boolean;
  canUpdateRefund?: boolean;
};
assert.equal(staffCancelledClaimable.canClaimRefund, true);
assert.equal(staffCancelledClaimable.canUpdateRefund, false);
assert.equal(
  staffCancelledClaimable.paymentStatusText,
  "₱100.00 • Refund Available to Claim",
);

const pendingClaimUpdateable = formatRequestCardData(
  makeBaseRequest({
    status: "cancelled",
    payments: [makePayment({ status: "verified", refundStatus: "pending" })],
  }),
) as ReturnType<typeof formatRequestCardData> & {
  canClaimRefund?: boolean;
  canUpdateRefund?: boolean;
};
assert.equal(pendingClaimUpdateable.canClaimRefund, false);
assert.equal(pendingClaimUpdateable.canUpdateRefund, true);

const finalizedRefundCard = formatRequestCardData(
  makeBaseRequest({
    status: "cancelled",
    payments: [makePayment({ status: "verified", refundStatus: "refunded" })],
  }),
) as ReturnType<typeof formatRequestCardData> & {
  canClaimRefund?: boolean;
  canUpdateRefund?: boolean;
};
assert.equal(finalizedRefundCard.canClaimRefund, false);
assert.equal(finalizedRefundCard.canUpdateRefund, false);

// 5. Dashboard & payment channel deductions exclude refunded and cancelled/rejected payments
const activePaidRaw: DocumentRequestWithRelations = {
  ...makeBaseRequest({ id: "req-active", status: "processing", amountDue: "250.00" }),
  documentType: {
    id: "doc-1",
    code: "OUR-TOR",
    name: "Transcript of Records",
    office: "registrar",
    category: "student",
    description: null,
    instructions: null,
    fee: "250.00",
    processingDays: 3,
    maxCopies: 1,
    isActive: true,
    sortOrder: 1,
    requiredFields: [],
    createdAt: "2026-11-20T08:00:00.000Z",
    updatedAt: "2026-11-20T08:00:00.000Z",
    officeRecord: {
      id: "off-our",
      code: "OUR",
      name: "Office of the University Registrar",
      sector: "OVPAA",
    },
  },
  payments: [makePayment({ id: "pay-active", requestId: "req-active", amount: "250.00", status: "verified", method: "e_wallet" })],
};

const refundedRaw: DocumentRequestWithRelations = {
  ...activePaidRaw,
  id: "req-refunded",
  status: "cancelled",
  amountDue: "150.00",
  payments: [
    makePayment({
      id: "pay-refunded",
      requestId: "req-refunded",
      amount: "150.00",
      status: "verified",
      method: "cash",
      refundStatus: "refunded",
    }),
  ],
};

const activeRow = normalizeRequestRow(activePaidRaw);
const refundedRow = normalizeRequestRow(refundedRaw);

assert.equal(activeRow.paymentMethod, "online");
assert.equal(refundedRow.paymentMethod, undefined);

const dashboardStats = buildStatsFromRequests([activeRow, refundedRow]) as ReturnType<
  typeof buildStatsFromRequests
> & {
  refundedAmount?: number;
  refundedTransactions?: number;
};
assert.equal(dashboardStats.totalRevenue, 250);
assert.equal(dashboardStats.settledTransactions, 1);
assert.equal(dashboardStats.refundedAmount, 150);
assert.equal(dashboardStats.refundedTransactions, 1);

const sectorStats = buildSectorWorkloadData([activeRow, refundedRow]);
const ovpaaSector = sectorStats.find((s) => s.sector === "OVPAA");
assert.ok(ovpaaSector);
assert.equal(ovpaaSector.revenue, 250);

console.log("All frontend refund workflow unit tests passed!");
