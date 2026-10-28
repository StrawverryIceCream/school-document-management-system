import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  extractOfficialReceiptData,
  hasOfficialReceipt,
  formatPaymentMethodLabel,
} from "../lib/payments/official-receipt";
import type { DocumentRequestWithRelations, Payment } from "../types";

describe("official-receipt", () => {
  const verifiedPayment: Payment = {
    id: "pay-1",
    requestId: "req-1",
    amount: "150.00",
    method: "e_wallet",
    referenceNumber: "GCASH-998877",
    paymentProofUrl: "https://example.com/proof.jpg",
    status: "verified",
    rejectionReason: null,
    submittedAt: "2026-10-20T10:00:00.000Z",
    reviewedBy: "user-cashier-1",
    reviewedAt: "2026-10-20T11:00:00.000Z",
    receiptNumber: "OR-2026-00088",
    reviewer: {
      id: "user-cashier-1",
      fullName: "Maria Santos (Cashier III)",
      email: "maria.santos@univ.edu.ph",
      role: "staff",
    },
    createdAt: new Date("2026-10-20T10:00:00.000Z"),
    updatedAt: new Date("2026-10-20T11:00:00.000Z"),
  };

  const rejectedPayment: Payment = {
    id: "pay-0",
    requestId: "req-1",
    amount: "150.00",
    method: "bank_transfer",
    referenceNumber: "INVALID-123",
    paymentProofUrl: null,
    status: "rejected",
    rejectionReason: "Unreadable receipt copy",
    submittedAt: "2026-10-19T09:00:00.000Z",
    reviewedBy: "user-cashier-1",
    reviewedAt: "2026-10-19T10:00:00.000Z",
    receiptNumber: null,
    reviewer: null,
    createdAt: new Date("2026-10-19T09:00:00.000Z"),
    updatedAt: new Date("2026-10-19T10:00:00.000Z"),
  };

  const mockRequest: DocumentRequestWithRelations = {
    id: "req-1",
    referenceNumber: "REQ-2026-000123",
    userId: "usr-student-1",
    documentTypeId: "doc-1",
    documentTypeCode: "TOR-UG",
    documentTypeName: "Transcript of Records (Undergraduate)",
    amountDue: "150.00",
    turnaroundDays: 3,
    copies: 2,
    purpose: "Employment abroad",
    formData: { studentId: "2023-01456" },
    status: "processing",
    windowId: null,
    assignedTo: null,
    processedAt: null,
    readyAt: null,
    releaseDate: "2026-10-25",
    releasePdfUrl: null,
    claimedAt: null,
    claimedBy: null,
    releasedBy: null,
    cancelledAt: null,
    cancellationReason: null,
    internalNotes: null,
    remarks: null,
    createdAt: new Date("2026-10-19T08:00:00.000Z"),
    updatedAt: new Date("2026-10-20T11:00:00.000Z"),
    user: {
      id: "usr-student-1",
      fullName: "Juan Dela Cruz",
      email: "juan.delacruz@univ.edu.ph",
      role: "student",
      studentId: "2023-01456",
      department: "Computer Studies",
    },
    payments: [rejectedPayment, verifiedPayment],
  };

  it("hasOfficialReceipt returns true when request has verified payment", () => {
    assert.equal(hasOfficialReceipt(mockRequest), true);
  });

  it("hasOfficialReceipt returns false when no verified payment exists", () => {
    const unverifiedRequest = { ...mockRequest, payments: [rejectedPayment] };
    assert.equal(hasOfficialReceipt(unverifiedRequest), false);
  });

  it("extractOfficialReceiptData selects the verified payment and formats all fields", () => {
    const data = extractOfficialReceiptData(mockRequest);
    assert.ok(data !== null, "Should return receipt data");
    assert.equal(data.receiptNumber, "OR-2026-00088");
    assert.equal(data.transactionReference, "GCASH-998877");
    assert.equal(data.requestReferenceNumber, "REQ-2026-000123");
    assert.equal(data.payerName, "Juan Dela Cruz");
    assert.equal(data.studentId, "2023-01456");
    assert.equal(data.documentTitle, "Transcript of Records (Undergraduate)");
    assert.equal(data.copies, 2);
    assert.equal(data.amountPaidFormatted, "₱150.00");
    assert.equal(data.paymentMethodLabel, "E-Wallet");
    assert.equal(data.verifyingOfficer, "Maria Santos (Cashier III)");
    assert.equal(data.status, "verified");
  });

  it("extractOfficialReceiptData handles request without user relation gracefully", () => {
    const requestNoUser = {
      ...mockRequest,
      user: undefined,
    };
    const data = extractOfficialReceiptData(requestNoUser);
    assert.ok(data !== null);
    assert.equal(data.payerName, "2023-01456");
  });

  it("extractOfficialReceiptData handles fallback receipt number if receiptNumber was null", () => {
    const paymentNoReceiptNum: Payment = {
      ...verifiedPayment,
      receiptNumber: null,
    };
    const req = { ...mockRequest, payments: [paymentNoReceiptNum] };
    const data = extractOfficialReceiptData(req);
    assert.ok(data !== null);
    assert.equal(data.receiptNumber, "OR-pay-1");
  });

  it("formatPaymentMethodLabel maps standard enum values to human labels", () => {
    assert.equal(formatPaymentMethodLabel("e_wallet"), "E-Wallet");
    assert.equal(formatPaymentMethodLabel("bank_transfer"), "Bank Transfer");
    assert.equal(formatPaymentMethodLabel("card"), "Credit / Debit Card");
    assert.equal(formatPaymentMethodLabel("cash"), "Cash Counter");
  });
});
