import { and, eq, or } from "drizzle-orm";
import { db } from "../db/db.js";
import { notifications, users, documentRequests } from "../db/schema.js";
import { sendStatusNotificationEmail } from "./email.service.js";

export interface CreateNotificationParams {
  userId: string;
  senderId?: string | null;
  requestId?: string | null;
  type?: "status_update" | "payment" | "appointment" | "announcement" | "system";
  title?: string;
  message: string;
  emailDetails?: {
    releaseDate?: string | null;
    remarks?: string | null;
    releasePdfUrl?: string | null;
  };
}

export interface NotifyOfficeStaffParams {
  officeId?: string | null;
  officeCode?: string | null;
  senderId?: string | null;
  requestId?: string | null;
  type?: "status_update" | "payment" | "appointment" | "announcement" | "system";
  title?: string;
  message: string;
}

/**
 * Creates an in-app notification record and asynchronously dispatches an email if available.
 */
export async function createAndDispatchNotification(
  params: CreateNotificationParams,
) {
  const {
    userId,
    senderId = null,
    requestId = null,
    type = "system",
    title = "Notification",
    message,
    emailDetails,
  } = params;

  // 1. Create In-App Notification
  const [created] = await db
    .insert(notifications)
    .values({
      userId,
      senderId,
      requestId,
      type,
      title,
      message,
    })
    .returning();

  if (!created) {
    throw new Error("Failed to create notification");
  }

  // 2. Asynchronously Dispatch Email
  void (async () => {
    try {
      const recipient = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: { email: true, fullName: true },
      });

      if (!recipient?.email) return;

      let documentName = "Document";
      let referenceNumber = "REF";

      if (requestId) {
        const reqData = await db.query.documentRequests.findFirst({
          where: eq(documentRequests.id, requestId),
          columns: { referenceNumber: true, documentTypeName: true },
        });
        if (reqData) {
          referenceNumber = reqData.referenceNumber;
          documentName = reqData.documentTypeName;
        }
      }

      const emailResult = await sendStatusNotificationEmail(
        recipient.email,
        recipient.fullName,
        documentName,
        referenceNumber,
        title,
        emailDetails,
      );

      if (emailResult.delivered) {
        await db
          .update(notifications)
          .set({ emailSentAt: new Date() })
          .where(eq(notifications.id, created.id));
      }
    } catch (err) {
      console.error("[createAndDispatchNotification] Async email error:", err);
    }
  })();

  return created;
}

/**
 * Fans out a notification to all active staff members assigned to a specific office.
 */
export async function notifyOfficeStaff(
  params: NotifyOfficeStaffParams,
): Promise<number> {
  const {
    officeId,
    officeCode,
    senderId = null,
    requestId = null,
    type = "system",
    title = "Office Notification",
    message,
  } = params;

  // Build match condition for staff in this office
  const matchConditions = [];
  if (officeId) {
    matchConditions.push(eq(users.officeId, officeId));
  }
  if (officeCode) {
    matchConditions.push(eq(users.office, officeCode as any));
  }

  interface StaffRecipient {
    id: string;
    email: string;
    fullName: string;
  }
  let staffList: StaffRecipient[] = [];
  if (matchConditions.length > 0) {
    staffList = await db.query.users.findMany({
      where: and(
        eq(users.role, "staff"),
        matchConditions.length === 1 ? matchConditions[0] : or(...matchConditions),
      ),
      columns: { id: true, email: true, fullName: true },
    });
  }

  // Fallback to admins if no staff assigned to office
  if (staffList.length === 0) {
    staffList = await db.query.users.findMany({
      where: eq(users.role, "admin"),
      columns: { id: true, email: true, fullName: true },
    });
  }

  if (staffList.length === 0) {
    return 0;
  }

  // Fan out in-app notifications
  const rows = staffList.map((staff) => ({
    userId: staff.id,
    senderId,
    requestId,
    type,
    title,
    message,
  }));

  const createdRows = await db.insert(notifications).values(rows).returning();

  return createdRows.length;
}
