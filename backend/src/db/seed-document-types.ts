import { neon } from "@neondatabase/serverless";

const documentSeeds = [
  {
    code: "HRMO-COE",
    name: "Certificate of Employment",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Official verification of employment with the university.",
  },
  {
    code: "HRMO-TL",
    name: "Certificate of Teaching Load",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Certification of an employee's teaching assignments.",
  },
  {
    code: "HRMO-SR",
    name: "Service Record",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Official record of service with the university.",
  },
  {
    code: "HRMO-CLC",
    name: "Certificate of Leave Credits",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Certification of an employee's leave-credit balance.",
  },
  {
    code: "HRMO-BIR2316",
    name: "Certificate of Compensation / BIR Form 2316",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Certification of compensation or a copy of BIR Form 2316.",
  },
  {
    code: "HRMO-CONTRIB",
    name: "Certificate of Contributions (GSIS, Pag-IBIG, PhilHealth)",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description:
      "Certification of recorded GSIS, Pag-IBIG, and PhilHealth contributions.",
  },
  {
    code: "HRMO-APPT",
    name: "Copy of Appointment or Designation Papers",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Copy of an employee's appointment or designation papers.",
  },
  {
    code: "HRMO-CLEAR",
    name: "Employee Clearance",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Employee clearance for resignation, retirement, or transfer.",
  },
  {
    code: "OUR-COG",
    name: "Change of Grade / Completion Form",
    officeCode: "OUR",
    category: "student",
    allowedCategories: ["student"],
    legacyOffice: "registrar",
    description: "Form for a grade change or course-completion request.",
  },
  {
    code: "HRMO-SERVICE-HONORARIUM",
    name: "Certificate of Services Rendered / Honorarium",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description:
      "Certification of services rendered or honorarium for an employee.",
  },
  {
    code: "HRMO-TRAVEL",
    name: "Authority to Travel / Travel Order",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description: "Authority or travel order for an employee's official travel.",
  },
  {
    code: "HRMO-001",
    name: "Application for Leave (CSC Form No. 6) & Employee Clearance (CSC Form No. 7)",
    officeCode: "HRMO",
    category: "teacher",
    allowedCategories: ["teacher", "staff"],
    legacyOffice: "hr",
    description:
      "Leave application and leave-credit certification for vacation, sick, special privilege, maternity, paternity, study, or rehabilitation leave. CSC Form No. 7 clearance is required for leave of 30 days or more.",
    instructions:
      "Submit three original copies of CSC Form No. 6 with supporting documents (and CSC Form No. 7 if the leave is 30 days or more) to HRMO for credit certification. Route the application to the College Dean or Unit Head, VPAA or VPAF, and University President for approval. Return the approved form to HRMO and claim the employee copy.",
    processingDays: 3,
  },
] as const;

export async function seedDocumentTypes(databaseUrl: string): Promise<void> {
  const sql = neon(databaseUrl);
  const officeRows = await sql`
    SELECT code, id
    FROM offices
    WHERE code IN ('HRMO', 'OUR')
  `;
  const officeIds = new Map(
    officeRows.map((office) => [String(office.code), String(office.id)]),
  );
  const missingOffices = ["HRMO", "OUR"].filter(
    (code) => !officeIds.has(code),
  );
  if (missingOffices.length > 0) {
    throw new Error(
      `Cannot add document types: required offices are missing (${missingOffices.join(", ")})`,
    );
  }

  for (const document of documentSeeds) {
    const officeId = officeIds.get(document.officeCode);
    if (!officeId) {
      throw new Error(
        `Cannot add ${document.code}: office ${document.officeCode} was not found`,
      );
    }

    const existing = await sql`
      SELECT id
      FROM document_types
      WHERE code = ${document.code}
         OR lower(btrim(name)) = lower(btrim(${document.name}))
      LIMIT 1
    `;
    if (existing.length > 0) continue;

    await sql`
      INSERT INTO document_types (
        code,
        name,
        office_id,
        category,
        allowed_categories,
        office,
        description,
        instructions,
        fee,
        processing_days,
        is_active,
        required_fields
      )
      VALUES (
        ${document.code},
        ${document.name},
        ${officeId},
        ${document.category}::user_category,
        ${JSON.stringify(document.allowedCategories)}::jsonb,
        ${document.legacyOffice}::office,
        ${document.description},
        ${"instructions" in document ? document.instructions : null},
        0,
        ${"processingDays" in document ? document.processingDays : 3},
        true,
        '[]'::jsonb
      )
      ON CONFLICT (code) DO NOTHING
    `;
  }
}
