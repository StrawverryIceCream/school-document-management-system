import { db } from "../db.js";
import { offices, colleges } from "../schema.js";
import { eq } from "drizzle-orm";

export async function seedOffices() {
  console.log("🌱 Seeding TUP Manila Offices & Hierarchy...");

  // 1. Root: OUP
  const [oup] = await db
    .insert(offices)
    .values({
      code: "OUP",
      name: "Office of the University President",
      sector: "OUP",
      category: "EXECUTIVE",
      officialEmail: "president@tup.edu.ph",
      parentOfficeId: null,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: offices.code,
      set: {
        name: "Office of the University President",
        sector: "OUP",
        category: "EXECUTIVE",
        officialEmail: "president@tup.edu.ph",
      },
    })
    .returning();

  // 2. VP Sectors (Parent: OUP)
  const vpSectors = [
    {
      code: "OVPAA",
      name: "Office of the Vice President for Academic Affairs",
      sector: "OVPAA" as const,
      category: "EXECUTIVE" as const,
      officialEmail: "vpaa@tup.edu.ph",
      parentOfficeId: oup.id,
    },
    {
      code: "OVPAF",
      name: "Office of the Vice President for Administration and Finance",
      sector: "OVPAF" as const,
      category: "EXECUTIVE" as const,
      officialEmail: "vpaf@tup.edu.ph",
      parentOfficeId: oup.id,
    },
    {
      code: "OVPRE",
      name: "Office of the Vice President for Research and Extension",
      sector: "OVPRE" as const,
      category: "EXECUTIVE" as const,
      officialEmail: "vpre@tup.edu.ph",
      parentOfficeId: oup.id,
    },
    {
      code: "OVPPDSC",
      name: "Office of the VP for Planning, Development & Special Concerns",
      sector: "OVPPDSC" as const,
      category: "EXECUTIVE" as const,
      officialEmail: "vppdis@tup.edu.ph",
      parentOfficeId: oup.id,
    },
  ];

  const seededVps: Record<string, string> = { OUP: oup.id };
  for (const vp of vpSectors) {
    const [row] = await db
      .insert(offices)
      .values({ ...vp, isActive: true })
      .onConflictDoUpdate({
        target: offices.code,
        set: {
          name: vp.name,
          sector: vp.sector,
          category: vp.category,
          officialEmail: vp.officialEmail,
          parentOfficeId: vp.parentOfficeId,
        },
      })
      .returning();
    seededVps[vp.code] = row.id;
  }

  // 3. Child Offices
  const childOffices = [
    // Direct Presidential Units (Parent: OUP)
    { code: "OBS", name: "Office of the Board Secretary", sector: "OUP" as const, category: "ADMINISTRATIVE" as const, officialEmail: "boardsec@tup.edu.ph", parentOfficeId: seededVps.OUP },
    { code: "ICO", name: "Internal Control Office", sector: "OUP" as const, category: "ADMINISTRATIVE" as const, officialEmail: "ico@tup.edu.ph", parentOfficeId: seededVps.OUP },
    { code: "BAC", name: "Bids & Awards Committee", sector: "OUP" as const, category: "ADMINISTRATIVE" as const, officialEmail: "bac@tup.edu.ph", parentOfficeId: seededVps.OUP },
    { code: "IILEAO", name: "Linkages & External Affairs Office", sector: "OUP" as const, category: "ADMINISTRATIVE" as const, officialEmail: "linkages@tup.edu.ph", parentOfficeId: seededVps.OUP },

    // Academic Colleges (Parent: OVPAA)
    { code: "COL", name: "Academic Colleges (College Clearance)", sector: "OVPAA" as const, category: "COLLEGE" as const, officialEmail: "colleges@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "CIT", name: "College of Industrial Technology", sector: "OVPAA" as const, category: "COLLEGE" as const, officialEmail: "cit@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "CIE", name: "College of Industrial Education", sector: "OVPAA" as const, category: "COLLEGE" as const, officialEmail: "cie@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "COE", name: "College of Engineering", sector: "OVPAA" as const, category: "COLLEGE" as const, officialEmail: "coe@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "COS", name: "College of Science", sector: "OVPAA" as const, category: "COLLEGE" as const, officialEmail: "cos@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "CAFA", name: "College of Architecture and Fine Arts", sector: "OVPAA" as const, category: "COLLEGE" as const, officialEmail: "cafa@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "CLA", name: "College of Liberal Arts", sector: "OVPAA" as const, category: "COLLEGE" as const, officialEmail: "cla@tup.edu.ph", parentOfficeId: seededVps.OVPAA },

    // Academic Support Units (Parent: OVPAA)
    { code: "OUR", name: "Office of the University Registrar", sector: "OVPAA" as const, category: "ACADEMIC_SUPPORT" as const, officialEmail: "registrar@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "OAD", name: "Office of Admissions", sector: "OVPAA" as const, category: "ACADEMIC_SUPPORT" as const, officialEmail: "admissions@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "OSA", name: "Office of Student Affairs", sector: "OVPAA" as const, category: "ACADEMIC_SUPPORT" as const, officialEmail: "osa@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "OGS", name: "Guidance Office", sector: "OVPAA" as const, category: "ACADEMIC_SUPPORT" as const, officialEmail: "guidance@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "IRJP", name: "Industrial Relations and Job Placement Office", sector: "OVPAA" as const, category: "ACADEMIC_SUPPORT" as const, officialEmail: "irjp@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "ULLR", name: "University Library & Learning Resources", sector: "OVPAA" as const, category: "ACADEMIC_SUPPORT" as const, officialEmail: "library@tup.edu.ph", parentOfficeId: seededVps.OVPAA },
    { code: "NSTP", name: "National Service Training Program", sector: "OVPAA" as const, category: "ACADEMIC_SUPPORT" as const, officialEmail: "nstp@tup.edu.ph", parentOfficeId: seededVps.OVPAA },

    // Administration & Financial Units (Parent: OVPAF)
    { code: "HRMO", name: "Human Resource Management Office", sector: "OVPAF" as const, category: "ADMINISTRATIVE" as const, officialEmail: "hrmo@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "RMO", name: "Records Management Office", sector: "OVPAF" as const, category: "ADMINISTRATIVE" as const, officialEmail: "rmo@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "PO", name: "Procurement Office", sector: "OVPAF" as const, category: "ADMINISTRATIVE" as const, officialEmail: "procurement@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "SPO", name: "Supply & Property Office", sector: "OVPAF" as const, category: "ADMINISTRATIVE" as const, officialEmail: "supply@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "AUX", name: "Auxiliary Services", sector: "OVPAF" as const, category: "ADMINISTRATIVE" as const, officialEmail: "auxiliary@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "MDS", name: "Medical and Dental Services", sector: "OVPAF" as const, category: "ADMINISTRATIVE" as const, officialEmail: "medical@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "AO", name: "Accounting Office", sector: "OVPAF" as const, category: "FINANCIAL" as const, officialEmail: "accounting@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "BO", name: "Budget Office", sector: "OVPAF" as const, category: "FINANCIAL" as const, officialEmail: "budget@tup.edu.ph", parentOfficeId: seededVps.OVPAF },
    { code: "CO", name: "Cashier's Office", sector: "OVPAF" as const, category: "FINANCIAL" as const, officialEmail: "cashier@tup.edu.ph", parentOfficeId: seededVps.OVPAF },

    // Research & Planning Units (Parent: OVPRE / OVPPDSC)
    { code: "URDS", name: "University Research and Development Services", sector: "OVPRE" as const, category: "RESEARCH" as const, officialEmail: "urds@tup.edu.ph", parentOfficeId: seededVps.OVPRE },
    { code: "TLO-ITSO", name: "Technology Licensing Office / ITSO", sector: "OVPRE" as const, category: "RESEARCH" as const, officialEmail: "itso@tup.edu.ph", parentOfficeId: seededVps.OVPRE },
    { code: "PDO", name: "Planning and Development Office", sector: "OVPPDSC" as const, category: "PLANNING" as const, officialEmail: "pdo@tup.edu.ph", parentOfficeId: seededVps.OVPPDSC },
    { code: "IMDO", name: "Infrastructure Management and Development Office", sector: "OVPPDSC" as const, category: "PLANNING" as const, officialEmail: "imdo@tup.edu.ph", parentOfficeId: seededVps.OVPPDSC },
    { code: "QAASO", name: "Quality Assurance & Accreditation Services Office", sector: "OVPPDSC" as const, category: "PLANNING" as const, officialEmail: "qaacso@tup.edu.ph", parentOfficeId: seededVps.OVPPDSC },
  ];

  for (const child of childOffices) {
    const [row] = await db
      .insert(offices)
      .values({ ...child, isActive: true })
      .onConflictDoUpdate({
        target: offices.code,
        set: {
          name: child.name,
          sector: child.sector,
          category: child.category,
          officialEmail: child.officialEmail,
          parentOfficeId: child.parentOfficeId,
        },
      })
      .returning();

    // If it's a college, link to existing colleges table by code
    if (child.category === "COLLEGE") {
      await db
        .update(colleges)
        .set({ officeId: row.id })
        .where(eq(colleges.code, child.code));
    }
  }

  console.log("✅ Successfully seeded 32 TUP Manila offices!");
}

// Self-run when executed directly
if (process.argv[1]?.endsWith("offices.seed.ts")) {
  seedOffices()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
