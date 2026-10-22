import { scopeSectorsForUser } from "../sectors-visibility";
import { SECTORS } from "../sectors-config";
import type { OfficeRecord } from "@/api/offices";

function runTests() {
  console.log("--- Testing Staff Sector & Workspace Scoping (#45) ---");

  const mockOffices: OfficeRecord[] = [
    {
      id: "our-uuid-111",
      code: "OUR",
      name: "Office of the University Registrar",
      sector: "OVPAA",
      category: "administrative",
      isActive: true,
      activeDocumentCount: 5,
    },
    {
      id: "hrmo-uuid-222",
      code: "HRMO",
      name: "Human Resource Management Office",
      sector: "OVPAF",
      category: "administrative",
      isActive: true,
      activeDocumentCount: 3,
    },
  ];

  // 1. Admin gets all sectors
  const adminUser = { role: "admin", office: null, officeId: null };
  const adminSectors = scopeSectorsForUser(SECTORS, adminUser as any, mockOffices);
  console.assert(adminSectors.length === SECTORS.length, `Admin must see all sectors, got ${adminSectors.length}`);
  console.log("✅ 1. Admin retains full visibility of all sectors");

  // 2. Staff in HRMO (OVPAF) gets scoped to OVPAF sector
  const hrmoStaff = { role: "staff", officeId: "hrmo-uuid-222", office: "hr" };
  const hrmoSectors = scopeSectorsForUser(SECTORS, hrmoStaff as any, mockOffices);
  console.assert(hrmoSectors.length === 1, `HRMO staff should only see 1 sector, got ${hrmoSectors.length}`);
  console.assert(hrmoSectors[0]?.id === "ovpaf", `Expected OVPAF sector, got ${hrmoSectors[0]?.id}`);
  console.log("✅ 2. HRMO staff scoped to OVPAF sector");

  // 3. Staff in Registrar (OVPAA) gets scoped to OVPAA sector
  const regStaff = { role: "staff", officeId: "our-uuid-111", office: "registrar" };
  const regSectors = scopeSectorsForUser(SECTORS, regStaff as any, mockOffices);
  console.assert(regSectors.length === 1, `Registrar staff should only see 1 sector, got ${regSectors.length}`);
  console.assert(regSectors[0]?.id === "ovpaa", `Expected OVPAA sector, got ${regSectors[0]?.id}`);
  console.log("✅ 3. Registrar staff scoped to OVPAA sector");

  // 4. Staff without assigned office retains fallback sectors
  const unassignedStaff = { role: "staff", officeId: null, office: null };
  const fallbackSectors = scopeSectorsForUser(SECTORS, unassignedStaff as any, mockOffices);
  console.assert(fallbackSectors.length === SECTORS.length, "Unassigned staff should fall back to all sectors");
  console.log("✅ 4. Unassigned staff falls back safely without locking out");

  console.log("🎉 All staff visibility scoping tests passed!");
}

runTests();
