import { describe, it, expect } from "vitest";
import {
  generateRoutingStepsForRequest,
  completeRoutingStep,
} from "../src/services/routing.service.js";
import { db } from "../src/db/db.js";
import {
  users,
  documentTypes,
  documentRequests,
  requestRoutingSteps,
  offices,
} from "../src/db/schema.js";
import { eq } from "drizzle-orm";

describe("Clearance & Document Routing Engine", () => {
  it("generates parallel clearance steps for OUR-006 Application for Graduation", async () => {
    const steps = await generateRoutingStepsForRequest("OUR-006");
    const officeCodes = steps.map((s) => s.officeCode);
    expect(officeCodes).toEqual(
      expect.arrayContaining(["COL", "ULLR", "OSA", "URDS", "AO"])
    );
  });

  it("handles deficiency status without canceling parent request", async () => {
    // 1. Get or create test student
    let testUser = await db.query.users.findFirst({
      where: eq(users.email, "test.student@tup.edu.ph"),
    });
    if (!testUser) {
      const [created] = await db
        .insert(users)
        .values({
          fullName: "Test Student",
          email: "test.student@tup.edu.ph",
          passwordHash: "mock-hash",
          role: "student",
        })
        .returning();
      testUser = created;
    }

    // 2. Get OUR-006 doc type
    const docType = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.code, "OUR-006"),
    });
    expect(docType).toBeDefined();

    // 3. Create dummy document request
    const [req] = await db
      .insert(documentRequests)
      .values({
        userId: testUser.id,
        documentTypeId: docType!.id,
        documentTypeCode: docType!.code,
        documentTypeName: docType!.name,
        amountDue: "0",
        turnaroundDays: 0,
        status: "processing",
      })
      .returning();

    // 4. Generate persistent routing steps
    const generated = await generateRoutingStepsForRequest("OUR-006", req.id);
    expect(generated.length).toBeGreaterThan(0);

    const stepToTest = generated[0];
    const completed = await completeRoutingStep({
      stepId: stepToTest.id!,
      status: "action_required",
      remarks: "Unreturned library book or lab fee deficiency",
      staffUserId: testUser.id,
    });

    expect(completed.status).toBe("action_required");
    expect(completed.remarks).toContain("library book");

    // Parent request stays processing or on_hold, never cancelled
    const updatedReq = await db.query.documentRequests.findFirst({
      where: eq(documentRequests.id, req.id),
    });
    expect(updatedReq?.status).not.toBe("cancelled");
  });
});
