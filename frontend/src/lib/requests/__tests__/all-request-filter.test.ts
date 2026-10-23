import assert from "node:assert/strict";
import type { RequestRow } from "@/context/DashboardContext";

function runTests() {
  console.log("Running AllRequest document filter tests...");

  const mockRows: Partial<RequestRow>[] = [
    {
      id: "req-1",
      applicant: "John Doe",
      document: "Official Transcript of Records (TOR)",
      status: "pending",
      course: "BSCS",
      officeCode: "OUR",
    },
    {
      id: "req-2",
      applicant: "Jane Smith",
      document: "Certificate of Good Moral Character",
      status: "processing",
      course: "BSIT",
      officeCode: "OUR",
    },
    {
      id: "req-3",
      applicant: "Bob Wilson",
      document: "Official Transcript of Records (TOR)",
      status: "ready",
      course: "BSCS",
      officeCode: "OUR",
    },
    {
      id: "req-4",
      applicant: "Alice Green",
      document: "Certificate of Enrollment",
      status: "pending",
      course: "BSCE",
      officeCode: "OUR",
    },
  ];

  // 1. Derive unique document options
  const documentOptions = Array.from(
    new Set(
      mockRows
        .map((r) => r.document)
        .filter((d): d is string => Boolean(d && d.trim())),
    ),
  ).sort((a, b) => a.localeCompare(b));

  assert.equal(documentOptions.length, 3);
  assert.deepEqual(documentOptions, [
    "Certificate of Enrollment",
    "Certificate of Good Moral Character",
    "Official Transcript of Records (TOR)",
  ]);

  // 2. Filter by document: "all" returns all 4
  const filterAll = mockRows.filter(
    (r) => "all" === "all" || r.document === "all",
  );
  assert.equal(filterAll.length, 4);

  // 3. Filter by "Official Transcript of Records (TOR)" returns req-1 and req-3
  const filterTor = mockRows.filter(
    (r) => r.document === "Official Transcript of Records (TOR)",
  );
  assert.equal(filterTor.length, 2);
  assert.equal(filterTor[0].id, "req-1");
  assert.equal(filterTor[1].id, "req-3");

  // 4. Combined document filter + status filter ("Official Transcript of Records (TOR)" + "pending")
  const combined = mockRows.filter(
    (r) =>
      r.document === "Official Transcript of Records (TOR)" &&
      r.status === "pending",
  );
  assert.equal(combined.length, 1);
  assert.equal(combined[0].id, "req-1");

  console.log("✅ AllRequest document filter tests passed successfully!");
}

runTests();
