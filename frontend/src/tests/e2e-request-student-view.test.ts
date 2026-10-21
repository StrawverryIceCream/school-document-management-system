import assert from "node:assert/strict";
import { isDocumentEligible } from "../lib/documents/eligibility";
import { formatRequestCardData } from "../lib/requests/request-card";
import { filterRequestsByOffice } from "../lib/requests/office-filter";
import type { DocumentType, AuthUser } from "@/types";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import type { RequestRow } from "@/context/DashboardContext";

function runEndToEndPageRenderTests() {
  console.log("Running End-to-End Page Render & Logic Tests for Spec #53...");

  // -------------------------------------------------------------
  // Test Case 1: Student Status Document Eligibility (Issue #40)
  // -------------------------------------------------------------
  const graduatingStudent: AuthUser = {
    id: "user-grad",
    email: "grad@arch.edu",
    fullName: "Juan Graduating",
    role: "student",
    studentStatus: "graduating",
    isActive: true,
    studentId: "2022-0001",
    collegeId: null,
    courseId: null,
    section: null,
    yearLevel: 4,
    department: null,
    office: null,
    contactNumber: null,
    emailVerifiedAt: null,
    lastLoginAt: null,
  };

  const regularFreshman: AuthUser = {
    ...graduatingStudent,
    id: "user-freshman",
    fullName: "Maria Regular",
    studentStatus: "regular",
    yearLevel: 1,
  };

  const clearanceDoc: DocumentType = {
    id: "doc-clearance",
    code: "GRAD-CLR",
    name: "Graduation Clearance Certificate",
    office: "registrar",
    category: "student",
    allowedCategories: ["student"],
    allowedStudentStatuses: ["graduating"],
    description: "Clearance for graduating batch only",
    instructions: null,
    fee: "100.00",
    processingDays: 5,
    maxCopies: 1,
    isActive: true,
    sortOrder: 1,
    requiredFields: [],
    createdAt: "",
    updatedAt: "",
  };

  const enrollmentCertDoc: DocumentType = {
    id: "doc-coe",
    code: "COE",
    name: "Certificate of Enrollment",
    office: "registrar",
    category: "student",
    allowedCategories: ["student"],
    allowedStudentStatuses: [], // Open to all statuses
    description: "Proof of enrollment",
    instructions: null,
    fee: "50.00",
    processingDays: 2,
    maxCopies: 3,
    isActive: true,
    sortOrder: 2,
    requiredFields: [],
    createdAt: "",
    updatedAt: "",
  };

  // Assert Graduating student sees clearance, but freshman does NOT
  assert.equal(
    isDocumentEligible(clearanceDoc, graduatingStudent),
    true,
    "Graduation Clearance must be visible to graduating student",
  );
  assert.equal(
    isDocumentEligible(clearanceDoc, regularFreshman),
    false,
    "Graduation Clearance must NOT be visible to regular freshman",
  );

  // Assert both see open Certificate of Enrollment
  assert.equal(isDocumentEligible(enrollmentCertDoc, graduatingStudent), true);
  assert.equal(isDocumentEligible(enrollmentCertDoc, regularFreshman), true);

  console.log("✔ Slice 1 (Issue #40) - Student status eligibility filtering verified");

  // -------------------------------------------------------------
  // Test Case 2: My Request Card Dynamic Content (Issue #43)
  // -------------------------------------------------------------
  const myRequestMock: MyRequestWithDocumentName = {
    id: "99999999-1111-2222-3333-444444444444",
    referenceNumber: "REQ-2026-0042",
    userId: "user-grad",
    documentTypeId: "doc-clearance",
    documentTypeCode: "GRAD-CLR",
    documentTypeName: "Graduation Clearance Certificate",
    documentName: "Graduation Clearance Certificate",
    amountDue: "100.00",
    turnaroundDays: 5,
    copies: 1,
    purpose: "Employment requirement",
    formData: {},
    status: "ready",
    windowId: null,
    assignedTo: null,
    processedAt: null,
    readyAt: "2026-10-22T00:00:00Z",
    releaseDate: "2026-10-25",
    releasePdfUrl: "https://arch.edu/clearance-0042.pdf",
    claimedAt: null,
    claimedBy: null,
    releasedBy: null,
    cancelledAt: null,
    cancellationReason: null,
    internalNotes: null,
    remarks: "Pickup window 3",
    createdAt: "2026-10-20T00:00:00Z",
    updatedAt: "2026-10-22T00:00:00Z",
    documentType: clearanceDoc,
    payments: [
      {
        id: "pay-1",
        requestId: "99999999-1111-2222-3333-444444444444",
        receiptNumber: "RCP-2026-0042",
        amount: "100.00",
        method: "cash",
        status: "verified",
        paymentProofUrl: null,
        reviewedAt: "2026-10-21T00:00:00Z",
        reviewedBy: "cashier-1",
        submittedAt: "2026-10-21T00:00:00Z",
        referenceNumber: "TX-4242",
        createdAt: "2026-10-21T00:00:00Z",
        updatedAt: "2026-10-21T00:00:00Z",
      },
    ],
  };

  const cardData = formatRequestCardData(myRequestMock);

  // Assert card has real reference number, real office name, paid badge
  assert.equal(cardData.referenceNumber, "REQ-2026-0042");
  assert.equal(cardData.isPaid, true);
  assert.equal(cardData.paymentStatusText, "Paid (₱100.00)");
  assert.equal(cardData.officeName, "Office of the University Registrar");

  // Ensure dummy strings are not present in format
  assert.notEqual(cardData.officeName, "College of Science");
  assert.notEqual(cardData.paymentStatusText, "Express Priority");

  console.log("✔ Slice 2 (Issue #43) - My Request dynamic card fields verified");

  // -------------------------------------------------------------
  // Test Case 3: Office Shortcuts Filter in All Requests (Issue #48)
  // -------------------------------------------------------------
  const allRowsMock: RequestRow[] = [
    {
      id: "row-1",
      applicant: "Student A",
      document: "Diploma",
      status: "pending",
      submittedAt: null,
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "OUR",
      officeName: "Registrar Office",
    },
    {
      id: "row-2",
      applicant: "Teacher B",
      document: "Certificate",
      status: "processing",
      submittedAt: null,
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "HRMO",
      officeName: "Human Resources",
    },
  ];

  const filteredOur = filterRequestsByOffice(allRowsMock, "OUR");
  assert.equal(filteredOur.length, 1);
  assert.equal(filteredOur[0].id, "row-1");

  const filteredHrmo = filterRequestsByOffice(allRowsMock, "HRMO");
  assert.equal(filteredHrmo.length, 1);
  assert.equal(filteredHrmo[0].id, "row-2");

  const filteredAll = filterRequestsByOffice(allRowsMock, "all");
  assert.equal(filteredAll.length, 2);

  console.log("✔ Slice 3 (Issue #48) - AllRequest office shortcut filters verified");

  console.log("✅ All end-to-end tests for Spec #53 passed!");
}

runEndToEndPageRenderTests();
