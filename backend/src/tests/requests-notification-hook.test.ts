import assert from "node:assert/strict";
import { db } from "../db/db.js";
import { notifications, users, documentTypes, documentRequests, requestStatusHistory } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { createRequest, updateRequestStatus } from "../controllers/requests.controller.js";
import type { Request, Response } from "express";

async function runTest() {
  console.log("Running requests-notification-hook test...");

  // Find a student, staff, and active documentType
  const student = await db.query.users.findFirst({
    where: eq(users.role, "student"),
  });
  assert(student, "Requires a student in DB");

  const docType = await db.query.documentTypes.findFirst({
    where: eq(documentTypes.isActive, true),
  });
  assert(docType, "Requires an active documentType in DB");

  // 1. Test createRequest triggers staff notification
  let createdReqData: any = null;
  const mockReqCreate = {
    session: { userId: student.id },
    body: {
      documentTypeId: docType.id,
      purpose: "Testing notification trigger",
      formData: {},
    },
    ip: "127.0.0.1",
  } as unknown as Request;

  const mockResCreate = {
    status: (code: number) => {
      assert(code === 201 || code === 200, `Expected 201 created, got ${code}`);
      return mockResCreate;
    },
    json: (data: any) => {
      createdReqData = data;
      return mockResCreate;
    },
  } as unknown as Response;

  await createRequest(mockReqCreate as any, mockResCreate as any);
  assert(createdReqData && createdReqData.id, "Request must be created");

  // Verify staff notification was created
  const staffNotifs = await db.query.notifications.findMany({
    where: and(
      eq(notifications.requestId, createdReqData.id),
      eq(notifications.title, "New Document Request"),
    ),
  });
  assert(staffNotifs.length >= 1, "Staff members must be notified when new request arrives");
  console.log(`Verified ${staffNotifs.length} staff notification(s) created for new request`);

  // 2. Test updateRequestStatus triggers requester notification
  const staff = await db.query.users.findFirst({
    where: eq(users.role, "staff"),
  });
  const staffUser = staff || student; // Fallback to student if no staff

  let updatedStatusData: any = null;
  const mockReqUpdate = {
    session: { userId: staffUser.id },
    params: { id: createdReqData.id },
    body: {
      status: "processing",
      staffNotes: "Processing started by test",
    },
    ip: "127.0.0.1",
  } as unknown as Request;

  const mockResUpdate = {
    status: (code: number) => {
      assert(code === 200, `Expected 200 on status update, got ${code}`);
      return mockResUpdate;
    },
    json: (data: any) => {
      updatedStatusData = data;
      return mockResUpdate;
    },
  } as unknown as Response;

  await updateRequestStatus(mockReqUpdate as any, mockResUpdate as any);
  assert(updatedStatusData, "Status update must return data");

  // Verify student received processing notification
  const studentNotif = await db.query.notifications.findFirst({
    where: and(
      eq(notifications.userId, student.id),
      eq(notifications.requestId, createdReqData.id),
    ),
    orderBy: [desc(notifications.createdAt)],
  });

  assert(studentNotif, "Student must receive status notification");
  console.log("Verified student status update notification:", studentNotif.title);

  // Clean up created request, status history, and notifications
  await db.delete(notifications).where(eq(notifications.requestId, createdReqData.id));
  await db.delete(requestStatusHistory).where(eq(requestStatusHistory.requestId, createdReqData.id));
  await db.delete(documentRequests).where(eq(documentRequests.id, createdReqData.id));

  console.log("✅ requests-notification-hook test passed!");
}

runTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
