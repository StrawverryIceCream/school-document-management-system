import { db } from "../db/db.js";

async function verifyEnrichedRequestRelations() {
  console.log("Verifying document requests relation with officeRecord...");
  const sampleRequest = await db.query.documentRequests.findFirst({
    with: {
      documentType: {
        with: {
          officeRecord: {
            columns: {
              id: true,
              code: true,
              name: true,
              sector: true,
            },
          },
        },
      },
      user: {
        columns: { id: true, fullName: true, studentId: true },
      },
      payments: true,
    },
  });

  if (!sampleRequest) {
    console.log("ℹ️ No document requests found in DB; query schema and relations are valid.");
    process.exit(0);
  }

  console.log("Sample request fetched:", {
    id: sampleRequest.id,
    referenceNumber: sampleRequest.referenceNumber,
    documentTypeName: sampleRequest.documentType?.name,
    officeCode: sampleRequest.documentType?.officeRecord?.code,
    sector: sampleRequest.documentType?.officeRecord?.sector,
    paymentsCount: sampleRequest.payments?.length ?? 0,
  });

  console.log("✅ Enriched request relations verified successfully.");
}

verifyEnrichedRequestRelations().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
