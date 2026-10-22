import { filterOfficeStaff } from "../office-staff.js";

interface UserMinimal {
  id: string;
  fullName: string;
  officeId?: string | null;
  office?: any;
}

export function runTests() {
  console.log("Running OfficeRequestTable staff filter tests...");

  const allStaff: UserMinimal[] = [
    { id: "1", fullName: "Alice OUR", officeId: "our-id", office: "our" },
    { id: "2", fullName: "Bob HR", officeId: "hr-id", office: "hr" },
    { id: "3", fullName: "Charlie General", officeId: null, office: null },
  ];

  // Matches by officeId
  const ourOffice = { id: "our-id", code: "OUR" };
  const matched = filterOfficeStaff(allStaff, ourOffice);
  console.assert(matched.length === 1, `Expected 1 match, got ${matched.length}`);
  console.assert(matched[0].id === "1", `Expected Alice, got ${matched[0].fullName}`);

  // Matches by case-insensitive office code
  const hrOffice = { id: "diff-id", code: "HR" };
  const matchedHr = filterOfficeStaff(allStaff, hrOffice);
  console.assert(matchedHr.length === 1, `Expected 1 match, got ${matchedHr.length}`);
  console.assert(matchedHr[0].id === "2", `Expected Bob, got ${matchedHr[0].fullName}`);

  // Fallback to all staff if none explicitly assigned to office
  const unnamedOffice = { id: "unknown-id", code: "UNKNOWN" };
  const fallback = filterOfficeStaff(allStaff, unnamedOffice);
  console.assert(
    fallback.length === allStaff.length,
    `Expected fallback to all staff, got ${fallback.length}`,
  );

  console.log("OfficeRequestTable staff filter tests passed!");
}

runTests();
