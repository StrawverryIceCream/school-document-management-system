import { db } from "./db.js";
import { documentTypes, offices } from "./schema.js";
import { and, eq, isNull } from "drizzle-orm";

export async function backfillRegistrarOffices() {
  console.log("Starting registrar document backfill...");

  const ourOffice = await db.query.offices.findFirst({
    where: eq(offices.code, "OUR"),
  });

  if (!ourOffice) {
    throw new Error("OUR (Office of the University Registrar) not found in offices table");
  }

  const unlinkedRegistrarDocs = await db.query.documentTypes.findMany({
    where: and(
      eq(documentTypes.office, "registrar"),
      isNull(documentTypes.officeId),
    ),
  });

  console.log(`Found ${unlinkedRegistrarDocs.length} unlinked registrar documents.`);

  if (unlinkedRegistrarDocs.length > 0) {
    const result = await db
      .update(documentTypes)
      .set({ officeId: ourOffice.id })
      .where(
        and(
          eq(documentTypes.office, "registrar"),
          isNull(documentTypes.officeId),
        ),
      )
      .returning({ id: documentTypes.id, code: documentTypes.code });

    console.log(`Successfully linked ${result.length} documents to OUR (${ourOffice.id}).`);
  }

  return unlinkedRegistrarDocs.length;
}

backfillRegistrarOffices()
  .then(() => {
    console.log("✅ Registrar backfill complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Registrar backfill failed:", err);
    process.exit(1);
  });
