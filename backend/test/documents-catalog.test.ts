import { describe, it, expect } from "vitest";
import { db } from "../src/db/db.js";
import { documentTypes } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

describe("TUP Manila Document Catalog", () => {
  it("seeds OUR-008 TOR with PER_PAGE feeUnit and minute SLA", async () => {
    const tor = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.code, "OUR-008"),
    });
    expect(tor).toBeDefined();
    expect(tor?.name).toBe("Transcript of Records (TOR)");
    expect(tor?.feeUnit).toBe("PER_PAGE");
    expect(Number(tor?.fee)).toBe(100.0);
    expect(tor?.slaMinutes).toBeGreaterThan(0);
  });

  it("seeds ULLR-001 allowing both students and teachers", async () => {
    const doc = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.code, "ULLR-001"),
    });
    expect(doc).toBeDefined();
    expect(doc?.allowedCategories).toEqual(
      expect.arrayContaining(["student", "teacher", "staff"])
    );
  });
});
