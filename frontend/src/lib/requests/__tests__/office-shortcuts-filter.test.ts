import assert from "node:assert/strict";
import { filterRequestsByOffice } from "../office-filter";
import type { RequestRow } from "@/context/DashboardContext";

function runTests() {
  console.log("Running office-shortcuts-filter test...");

  const mockRows: Partial<RequestRow>[] = [
    {
      id: "req-1",
      applicant: "Student One",
      document: "Transcript",
      status: "pending",
      officeCode: "OUR",
      officeName: "Office of the University Registrar",
    },
    {
      id: "req-2",
      applicant: "Student Two",
      document: "Certificate of Enrollment",
      status: "processing",
      officeCode: "OUR",
      officeName: "Office of the University Registrar",
    },
    {
      id: "req-3",
      applicant: "Teacher One",
      document: "Service Record",
      status: "pending",
      officeCode: "HRMO",
      officeName: "Human Resources Management Office",
    },
  ];

  // 1. "all" returns everything
  const allRows = filterRequestsByOffice(mockRows as RequestRow[], "all");
  assert.equal(allRows.length, 3, "All filter must return all rows");

  // 2. Filter by officeCode "OUR"
  const ourRows = filterRequestsByOffice(mockRows as RequestRow[], "OUR");
  assert.equal(ourRows.length, 2, "OUR filter must return 2 rows");
  assert(ourRows.every((r) => r.officeCode === "OUR"), "All returned rows must be OUR");

  // 3. Filter by officeCode "HRMO"
  const hrmoRows = filterRequestsByOffice(mockRows as RequestRow[], "HRMO");
  assert.equal(hrmoRows.length, 1, "HRMO filter must return 1 row");
  assert.equal(hrmoRows[0].id, "req-3", "HRMO must return req-3");

  // 4. Filter by officeName
  const byNameRows = filterRequestsByOffice(
    mockRows as RequestRow[],
    "Human Resources Management Office",
  );
  assert.equal(byNameRows.length, 1, "Must match by officeName as well");

  console.log("✅ office-shortcuts-filter tests passed!");
}

runTests();
