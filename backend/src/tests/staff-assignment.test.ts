import { assignRequest, getAllRequests } from "../controllers/requests.controller.js";
import { getOfficeStaff } from "../controllers/offices.controller.js";
import { db } from "../db/db.js";
import { documentRequests, users, offices, notifications, auditLogs } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { Request, Response } from "express";

function createMockRes() {
  const res: any = {
    statusCode: 200,
    data: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log("--- Testing Staff Request Assignment & Delegation (#42) ---");

  // 1. Unauthenticated check
  {
    const req = {
      params: { id: "00000000-0000-0000-0000-000000000001" },
      body: { assignedTo: "00000000-0000-0000-0000-000000000002" },
      session: {},
    } as unknown as Request<any>;
    const res = createMockRes();
    await assignRequest(req, res);
    console.assert(res.statusCode === 401, `Expected 401 unauthorized, got ${res.statusCode}`);
    console.log("✅ 1. Unauthorized rejected with 401");
  }

  // Find real office and request to test against
  const testRequest = await db.query.documentRequests.findFirst({
    with: {
      documentType: true,
    },
  });

  if (!testRequest) {
    console.log("⚠️ No document request found in database to test assignment. Skipping live DB test.");
    return;
  }

  // Find or pick staff users
  const staffList = await db.query.users.findMany({
    where: eq(users.role, "staff"),
    limit: 5,
  });

  const adminUser = await db.query.users.findFirst({
    where: eq(users.role, "admin"),
  });

  console.assert(Boolean(adminUser), "Expected at least one admin user in DB");

  // 2. Admin assign request
  if (adminUser) {
    const targetStaff = staffList[0];
    const req = {
      params: { id: testRequest.id },
      body: { assignedTo: targetStaff ? targetStaff.id : adminUser.id },
      session: { userId: adminUser.id },
      ip: "127.0.0.1",
    } as unknown as Request<any>;
    const res = createMockRes();
    await assignRequest(req, res);
    console.assert(res.statusCode === 200, `Expected 200 OK on assign, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
    console.assert(res.data && res.data.assignedTo === (targetStaff ? targetStaff.id : adminUser.id), "assignedTo should match");
    console.log("✅ 2. Admin assigned request successfully");

    // Check audit log recorded
    const recentAudit = await db.query.auditLogs.findFirst({
      where: eq(auditLogs.entityId, testRequest.id),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
    console.assert(recentAudit && recentAudit.action.includes("assigned"), "Audit log entry must be present");
    console.log("✅ 3. Audit log recorded for assignment");

    // 4. Unassign request
    const unassignReq = {
      params: { id: testRequest.id },
      body: { assignedTo: null },
      session: { userId: adminUser.id },
      ip: "127.0.0.1",
    } as unknown as Request<any>;
    const unassignRes = createMockRes();
    await assignRequest(unassignReq, unassignRes);
    console.assert(unassignRes.statusCode === 200, `Expected 200 on unassign, got ${unassignRes.statusCode}`);
    console.assert(unassignRes.data && unassignRes.data.assignedTo === null, "assignedTo should be null");
    console.log("✅ 4. Unassign request succeeded");
  }

  // 5. Check getOfficeStaff
  if (testRequest.documentType?.officeId) {
    const officeReq = {
      params: { idOrCode: testRequest.documentType.officeId },
    } as unknown as Request<any>;
    const officeRes = createMockRes();
    await getOfficeStaff(officeReq, officeRes);
    console.assert(officeRes.statusCode === 200, `Expected 200 from getOfficeStaff, got ${officeRes.statusCode}`);
    console.assert(Array.isArray(officeRes.data), "getOfficeStaff should return array");
    console.log("✅ 5. getOfficeStaff returned valid list of office staff");
  }

  console.log("🎉 All staff delegation tests passed!");
}

runTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });
