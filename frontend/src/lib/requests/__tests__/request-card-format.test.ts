import assert from "node:assert/strict";
import { formatRequestCardData } from "../request-card";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";

function runTests() {
  console.log("Running request-card-format test...");

  const mockRequest: Partial<MyRequestWithDocumentName> = {
    id: "3e5a7b8c-1234-5678-9abc-def012345678",
    referenceNumber: "REQ-2026-0042",
    documentName: "Official Transcript of Records",
    amountDue: "150.00",
    releaseDate: "2026-10-30",
    releasePdfUrl: "https://example.com/transcript.pdf",
    documentType: {
      id: "doc-1",
      code: "TOR",
      name: "Official Transcript of Records",
      office: "registrar",
      officeRecord: {
        id: "off-1",
        code: "OUR",
        name: "Office of the University Registrar",
        sector: "academic",
      },
      category: "student",
      description: "Official transcript",
      instructions: null,
      fee: "150.00",
      processingDays: 3,
      maxCopies: 5,
      isActive: true,
      sortOrder: 1,
      requiredFields: [],
      createdAt: "",
      updatedAt: "",
    },
    payments: [],
  };

  // 1. Reference number priority
  const data = formatRequestCardData(mockRequest as MyRequestWithDocumentName);
  assert.equal(data.referenceNumber, "REQ-2026-0042", "Must use official reference number");
  assert.equal(data.officeName, "Office of the University Registrar", "Must resolve office from officeRecord");
  assert.equal(data.paymentStatusText, "₱150.00 • Awaiting Payment", "Unpaid request must show awaiting payment");
  assert.equal(data.isPaid, false, "Must not be marked paid");

  // 2. Paid request
  const paidRequest: Partial<MyRequestWithDocumentName> = {
    ...mockRequest,
    payments: [
      {
        id: "pay-1",
        requestId: mockRequest.id!,
        receiptNumber: "RCP-1234",
        amount: "150.00",
        method: "cash",
        status: "verified",
        paymentProofUrl: null,
        rejectionReason: null,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "staff-1",
        submittedAt: new Date().toISOString(),
        referenceNumber: "TX-1234",
        createdAt: "",
        updatedAt: "",
      },
    ],
  };
  const paidData = formatRequestCardData(paidRequest as MyRequestWithDocumentName);
  assert.equal(paidData.isPaid, true, "Must be marked paid when verified payment exists");
  assert.equal(paidData.paymentStatusText, "Paid (₱150.00)", "Must indicate verified payment");

  // 3. Fallback when referenceNumber is missing
  const noRefRequest: Partial<MyRequestWithDocumentName> = {
    ...mockRequest,
    referenceNumber: "",
  };
  const noRefData = formatRequestCardData(noRefRequest as MyRequestWithDocumentName);
  assert.equal(noRefData.referenceNumber, "#3e5a7b8c", "Must fallback to truncated ID when referenceNumber empty");

  console.log("✅ request-card-format tests passed!");
}

runTests();
