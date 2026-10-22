import { matchesOffice } from "../sector-matching";
import { getOffice } from "../sectors-config";
import type { DocumentRequestWithRelations } from "@/types";

function runTests() {
  console.log("Running sector-matching unit tests...");

  const cafaOffice = getOffice("ovpaa", "colleges", "cafa");
  console.assert(cafaOffice !== undefined, "CAFA office must exist in config");

  const ovpafOffice = getOffice("ovpaf", "admin-services", "ovpaf");
  console.assert(ovpafOffice !== undefined, "OVPAF office must exist in config");

  // Mock request for Permit for Use of University Vehicle & Trip Ticket by a CAFA student
  const vehicleRequestMock: Partial<DocumentRequestWithRelations> = {
    id: "req-vehicle-1",
    documentTypeCode: "OVPAF-002",
    documentTypeName: "Permit for Use of University Vehicle & Trip Ticket",
    documentType: {
      id: "doc-v-1",
      code: "OVPAF-002",
      name: "Permit for Use of University Vehicle & Trip Ticket",
      office: "OVPAF",
      officeRecord: {
        id: "off-v-1",
        code: "OVPAF",
        name: "Office of the Vice President for Administration and Finance",
        sector: "OVPAF",
      },
    } as any,
    user: {
      id: "user-1",
      fullName: "Juan Dela Cruz",
      college: {
        id: "col-cafa",
        code: "CAFA",
        name: "College of Architecture and Fine Arts",
      },
    } as any,
  };

  // Must match OVPAF office
  const matchesVPAF = matchesOffice(vehicleRequestMock as DocumentRequestWithRelations, ovpafOffice!);
  console.assert(matchesVPAF === true, "Vehicle request must match OVPAF office");

  // Must NOT match CAFA college office despite user being from CAFA!
  const matchesCAFA = matchesOffice(vehicleRequestMock as DocumentRequestWithRelations, cafaOffice!);
  console.assert(matchesCAFA === false, "Vehicle request must NOT match CAFA college office");

  // College clearance document by CAFA student must match CAFA
  const clearanceMock: Partial<DocumentRequestWithRelations> = {
    id: "req-clr-1",
    documentTypeCode: "COL-001",
    documentTypeName: "College Clearance",
    documentType: {
      id: "doc-c-1",
      code: "COL-001",
      name: "College Clearance",
      officeRecord: {
        id: "off-col",
        code: "COL",
        name: "Academic Colleges",
        sector: "OVPAA",
      },
    } as any,
    user: {
      id: "user-1",
      college: {
        code: "CAFA",
        name: "College of Architecture and Fine Arts",
      },
    } as any,
  };

  const clearanceMatchesCAFA = matchesOffice(clearanceMock as DocumentRequestWithRelations, cafaOffice!);
  console.assert(clearanceMatchesCAFA === true, "College clearance must match CAFA office");

  console.log("✅ All sector-matching unit tests passed!");
}

runTests();
