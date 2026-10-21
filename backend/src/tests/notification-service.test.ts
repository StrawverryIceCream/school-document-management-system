import assert from "node:assert/strict";
import { db } from "../db/db.js";
import { notifications, users, offices } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import {
  createAndDispatchNotification,
  notifyOfficeStaff,
} from "../services/notification.service.js";

async function runTest() {
  console.log("Running notification-service test...");

  // Find a test user to receive notification
  const testStudent = await db.query.users.findFirst({
    where: eq(users.role, "student"),
  });
  assert(testStudent, "Test requires at least one student user in db");

  // 1. Test createAndDispatchNotification
  const notif = await createAndDispatchNotification({
    userId: testStudent.id,
    type: "status_update",
    title: "Test Status Update",
    message: "Your document request is now processing.",
  });

  assert(notif, "Notification should be returned");
  assert.equal(notif.userId, testStudent.id);
  assert.equal(notif.title, "Test Status Update");
  assert.equal(notif.isRead, false);

  // Verify in database
  const inDb = await db.query.notifications.findFirst({
    where: eq(notifications.id, notif.id),
  });
  assert(inDb, "Notification record must exist in DB");
  assert.equal(inDb.title, "Test Status Update");

  // 2. Test notifyOfficeStaff
  // Find a staff user and their office
  const testStaff = await db.query.users.findFirst({
    where: eq(users.role, "staff"),
  });

  if (testStaff && testStaff.officeId) {
    const createdCount = await notifyOfficeStaff({
      officeId: testStaff.officeId,
      type: "system",
      title: "New Incoming Request",
      message: "A new document request has been submitted for your office.",
    });

    assert(createdCount >= 1, "At least one staff member should receive the notification");

    // Check staff received notification
    const staffNotif = await db.query.notifications.findFirst({
      where: and(
        eq(notifications.userId, testStaff.id),
        eq(notifications.title, "New Incoming Request"),
      ),
      orderBy: [desc(notifications.createdAt)],
    });

    assert(staffNotif, "Staff must have received the notification in their feed");
  } else {
    console.log("Notice: No staff with officeId found, skipping staff fan-out check");
  }

  // Cleanup test notification
  await db.delete(notifications).where(eq(notifications.id, notif.id));

  console.log("✅ notification-service tests passed!");
}

runTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
