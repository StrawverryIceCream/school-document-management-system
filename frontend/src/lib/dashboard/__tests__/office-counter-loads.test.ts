import { calculateOfficeCounterLoads } from "../counter-loads";
import type { RequestRow } from "@/context/DashboardContext";

function runTests() {
  console.log("--- Testing Office Counter Loads Aggregation (#44) ---");

  const sampleRequests: RequestRow[] = [
    {
      id: "1",
      applicant: "Student 1",
      document: "Transcript",
      status: "pending",
      submittedAt: "2026-10-20T00:00:00Z",
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "OUR",
      officeName: "Office of the University Registrar",
      sector: "OVPAA",
    },
    {
      id: "2",
      applicant: "Student 2",
      document: "Certificate of Grades",
      status: "processing",
      submittedAt: "2026-10-20T00:00:00Z",
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "OUR",
      officeName: "Office of the University Registrar",
      sector: "OVPAA",
    },
    {
      id: "3",
      applicant: "Employee 1",
      document: "Service Record",
      status: "pending",
      submittedAt: "2026-10-20T00:00:00Z",
      releaseDate: null,
      claimedAt: null,
      purpose: null,
      officeCode: "HRMO",
      officeName: "Human Resource Management Office",
      sector: "OVPAF",
    },
    {
      id: "4",
      applicant: "Student 3",
      document: "Diploma",
      status: "claimed", // completed / terminal: should NOT count towards active load
      submittedAt: "2026-10-19T00:00:00Z",
      releaseDate: null,
      claimedAt: "2026-10-20T00:00:00Z",
      purpose: null,
      officeCode: "OUR",
      officeName: "Office of the University Registrar",
      sector: "OVPAA",
    },
  ];

  const loads = calculateOfficeCounterLoads(sampleRequests);

  console.assert(Array.isArray(loads), "Result must be an array");
  console.assert(loads.length > 0, "Must contain office load items");

  const ourOffice = loads.find((l) => l.officeCode === "OUR");
  console.assert(ourOffice !== undefined, "OUR must be present");
  console.assert(ourOffice?.count === 2, `Expected OUR count 2, got ${ourOffice?.count}`);
  console.assert(ourOffice?.statusText === "Normal", `Expected status Normal, got ${ourOffice?.statusText}`);

  const hrmoOffice = loads.find((l) => l.officeCode === "HRMO");
  console.assert(hrmoOffice !== undefined, "HRMO must be present");
  console.assert(hrmoOffice?.count === 1, `Expected HRMO count 1, got ${hrmoOffice?.count}`);

  // Test load thresholds
  const heavyRequests: RequestRow[] = Array.from({ length: 9 }, (_, i) => ({
    id: `heavy-${i}`,
    applicant: `Staff ${i}`,
    document: "Document",
    status: "processing",
    submittedAt: "2026-10-20T00:00:00Z",
    releaseDate: null,
    claimedAt: null,
    purpose: null,
    officeCode: "CASHIER",
    officeName: "Cashier Office",
    sector: "OVPAF",
  }));

  const heavyLoads = calculateOfficeCounterLoads(heavyRequests);
  const cashierOffice = heavyLoads.find((l) => l.officeCode === "CASHIER");
  console.assert(cashierOffice?.count === 9, `Expected Cashier count 9, got ${cashierOffice?.count}`);
  console.assert(cashierOffice?.statusText === "Heavy", `Expected Heavy load, got ${cashierOffice?.statusText}`);

  console.log("🎉 All office counter loads calculations passed!");
}

runTests();
