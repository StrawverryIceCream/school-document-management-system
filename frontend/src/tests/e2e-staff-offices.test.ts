import assert from "node:assert/strict";
import { calculateOfficeCounterLoads } from "../lib/dashboard/counter-loads";
import { scopeSectorsForUser } from "../lib/sectors/sectors-visibility";
import { SECTORS } from "../lib/sectors/sectors-config";
import { normalizeRequestRow } from "../lib/requests/requests";
import type { RequestRow } from "@/context/DashboardContext";
import type { DocumentRequestWithRelations } from "@/types";
import type { OfficeRecord } from "@/api/offices";

function runEndToEndStaffAndOfficesTests() {
  console.log("Running End-to-End Tests for Spec #54 (Staff Operations, Delegation & Scoped Workspace)...");

  // -------------------------------------------------------------
  // Slice 1: Staff Request Assignment & Data Normalization (#42)
  // -------------------------------------------------------------
  console.log("\n[Slice 1] Testing Staff Assignment & Data Normalization...");

  const rawAssignedRequest: DocumentRequestWithRelations = {
    id: "req-101",
    referenceNumber: "REQ-2026-000101",
    userId: "student-1",
    documentTypeId: "doc-tor",
    documentTypeCode: "OUR-TOR",
    documentTypeName: "Transcript of Records",
    amountDue: "150.00",
    turnaroundDays: 5,
    copies: 1,
    purpose: "Employment",
    formData: { reason: "job application" },
    status: "processing",
    windowId: null,
    assignedTo: "staff-202",
    processedAt: null,
    readyAt: null,
    releaseDate: "2026-10-25",
    releasePdfUrl: null,
    claimedAt: null,
    claimedBy: null,
    releasedBy: null,
    cancelledAt: null,
    cancellationReason: null,
    internalNotes: "Documents verified",
    remarks: "In process",
    createdAt: "2026-10-20T08:00:00Z",
    updatedAt: "2026-10-21T09:00:00Z",
    assignee: {
      id: "staff-202",
      fullName: "Jane Staff",
      email: "jane@university.edu",
      role: "staff",
      studentId: null,
      department: "Registrar Office",
      office: "registrar",
    },
    user: {
      id: "student-1",
      fullName: "Juan Dela Cruz",
      email: "juan@student.edu",
      role: "student",
      studentId: "2023-1001",
      collegeId: "cos-id",
      department: "BSCS",
      section: "3A",
      college: { id: "cos-id", code: "COS", name: "College of Science" },
      office: null,
    },
    documentType: {
      id: "doc-tor",
      code: "OUR-TOR",
      name: "Transcript of Records",
      officeId: "our-uuid",
      officeRecord: {
        id: "our-uuid",
        code: "OUR",
        name: "Office of the University Registrar",
        sector: "OVPAA",
      },
      category: "student",
      office: "registrar",
      description: "Official transcript",
      instructions: null,
      fee: "150.00",
      feeUnit: "FLAT" as any,
      processingDays: 5,
      slaMinutes: 1440,
      maxCopies: 5,
      isActive: true,
      sortOrder: 1,
      requiredFields: [],
      createdAt: "",
      updatedAt: "",
    },
  };

  const normalized = normalizeRequestRow(rawAssignedRequest);
  assert.equal(normalized.assignedTo, "staff-202", "assignedTo ID must be mapped");
  assert.equal(normalized.assignee?.fullName, "Jane Staff", "assignee fullName must be preserved");
  assert.equal(normalized.assignee?.role, "staff", "assignee role must be preserved");
  assert.equal(normalized.officeCode, "OUR", "officeCode must be properly resolved");
  assert.equal(normalized.sector, "OVPAA", "sector must be properly resolved");

  // Test unassigned request normalization
  const rawUnassigned: DocumentRequestWithRelations = {
    ...rawAssignedRequest,
    id: "req-102",
    assignedTo: null,
    assignee: null,
  };
  const normalizedUnassigned = normalizeRequestRow(rawUnassigned);
  assert.equal(normalizedUnassigned.assignedTo, undefined, "assignedTo should be undefined when null");
  assert.equal(normalizedUnassigned.assignee, null, "assignee should be null when unassigned");
  console.log("✅ Slice 1 passed: Request assignment and assignee data normalization verified");

  // -------------------------------------------------------------
  // Slice 2: Dynamic Office Counter Loads Telemetry (#44)
  // -------------------------------------------------------------
  console.log("\n[Slice 2] Testing Dynamic Office Counter Loads Telemetry...");

  const requestsCollection: RequestRow[] = [
    // 5 active requests for OUR
    ...Array.from({ length: 5 }, (_, i) => ({
      id: `our-${i}`,
      applicant: `Student ${i}`,
      document: "Transcript",
      status: "processing" as const,
      submittedAt: "2026-10-20T00:00:00Z",
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "OUR",
      officeName: "University Registrar",
      sector: "OVPAA",
    })),
    // 8 active requests for HRMO (Heavy load)
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `hrmo-${i}`,
      applicant: `Staff ${i}`,
      document: "Service Record",
      status: "pending" as const,
      submittedAt: "2026-10-20T00:00:00Z",
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "HRMO",
      officeName: "Human Resource Mgmt",
      sector: "OVPAF",
    })),
    // 2 active requests for Cashier
    ...Array.from({ length: 2 }, (_, i) => ({
      id: `cashier-${i}`,
      applicant: `Payer ${i}`,
      document: "Assessment Slip",
      status: "awaiting_payment" as const,
      submittedAt: "2026-10-20T00:00:00Z",
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "CASHIER",
      officeName: "Cashier Office",
      sector: "OVPAF",
    })),
    // 10 completed/claimed requests (should not be in active queue)
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `claimed-${i}`,
      applicant: `Claimer ${i}`,
      document: "Diploma",
      status: "claimed" as const,
      submittedAt: "2026-10-18T00:00:00Z",
      releaseDate: null,
      claimedAt: "2026-10-20T00:00:00Z",
      purpose: null,
      officeCode: "OUR",
      officeName: "University Registrar",
      sector: "OVPAA",
    })),
  ];

  const loads = calculateOfficeCounterLoads(requestsCollection, 6);
  assert.ok(loads.length > 0, "Counter loads must produce office list");

  // HRMO should be top with count 8 and 'Heavy' status
  const topOffice = loads[0];
  assert.equal(topOffice.officeCode, "HRMO", "HRMO should have highest queue load");
  assert.equal(topOffice.count, 8, "HRMO active count must be 8");
  assert.equal(topOffice.statusText, "Heavy", "Count 8 must be Heavy");

  // OUR should have count 5 and 'Active' status
  const ourLoad = loads.find((l) => l.officeCode === "OUR");
  assert.ok(ourLoad, "OUR office load must exist");
  assert.equal(ourLoad!.count, 5, "OUR active count must be 5 (excluding claimed)");
  assert.equal(ourLoad!.statusText, "Active", "Count 5 must be Active");

  // Cashier should have count 2 and 'Normal' status
  const cashierLoad = loads.find((l) => l.officeCode === "CASHIER");
  assert.ok(cashierLoad, "Cashier office load must exist");
  assert.equal(cashierLoad!.count, 2, "Cashier active count must be 2");
  assert.equal(cashierLoad!.statusText, "Normal", "Count 2 must be Normal");
  console.log("✅ Slice 2 passed: Dynamic office counter loads & severity calculation verified");

  // -------------------------------------------------------------
  // Slice 3: Sector & Division Navigation Scoping (#45)
  // -------------------------------------------------------------
  console.log("\n[Slice 3] Testing Scoped Workspace Navigation for Staff...");

  const mockOffices: OfficeRecord[] = [
    {
      id: "our-uuid",
      code: "OUR",
      name: "Office of the University Registrar",
      sector: "OVPAA",
      category: "administrative",
      isActive: true,
      activeDocumentCount: 10,
    },
    {
      id: "hrmo-uuid",
      code: "HRMO",
      name: "Human Resource Management Office",
      sector: "OVPAF",
      category: "administrative",
      isActive: true,
      activeDocumentCount: 8,
    },
  ];

  // Admin retains all sectors
  const adminUser = { role: "admin", officeId: null, office: null };
  const adminSectors = scopeSectorsForUser(SECTORS, adminUser as any, mockOffices);
  assert.equal(adminSectors.length, SECTORS.length, "Admin must see all university sectors");

  // OVPAF staff only sees OVPAF
  const ovpafStaff = { role: "staff", officeId: "hrmo-uuid", office: "hr" };
  const ovpafSectors = scopeSectorsForUser(SECTORS, ovpafStaff as any, mockOffices);
  assert.equal(ovpafSectors.length, 1, "Staff in HRMO must see only 1 sector");
  assert.equal(ovpafSectors[0].id, "ovpaf", "Staff in HRMO must be scoped to OVPAF");

  // OVPAA staff only sees OVPAA
  const ovpaaStaff = { role: "staff", officeId: "our-uuid", office: "registrar" };
  const ovpaaSectors = scopeSectorsForUser(SECTORS, ovpaaStaff as any, mockOffices);
  assert.equal(ovpaaSectors.length, 1, "Staff in OUR must see only 1 sector");
  assert.equal(ovpaaSectors[0].id, "ovpaa", "Staff in OUR must be scoped to OVPAA");

  console.log("✅ Slice 3 passed: Role-based navigation scoping verified");

  console.log("\n🎉 ALL E2E TESTS FOR SPEC #54 PASSED CLEANLY!");
}

runEndToEndStaffAndOfficesTests();
