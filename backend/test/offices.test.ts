import { describe, it, expect } from "vitest";
import { db } from "../src/db/db.js";
import { offices } from "../src/db/schema.js";
import { eq } from "drizzle-orm";
import { getDescendantOfficeIds } from "../src/services/office-tree.service.js";

describe("Offices Schema & Hierarchy", () => {
  it("queries seeded TUP Manila registrar under OVPAA", async () => {
    const ourOffice = await db.query.offices.findFirst({
      where: eq(offices.code, "OUR"),
    });
    expect(ourOffice).toBeDefined();
    expect(ourOffice?.name).toContain("Registrar");
    expect(ourOffice?.sector).toBe("OVPAA");
  });

  it("resolves child offices for sector heads", async () => {
    const vpaa = await db.query.offices.findFirst({
      where: eq(offices.code, "OVPAA"),
    });
    expect(vpaa).toBeDefined();
    const childIds = await getDescendantOfficeIds(vpaa!.id);
    expect(childIds.length).toBeGreaterThan(5);
  });
});
