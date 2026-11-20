import { and, eq, or } from "drizzle-orm";
import { db } from "../db/db.js";
import { notifications, users, documentRequests } from "../db/schema.js";
import { isActiveAdminRecipient } from "../lib/term-standing.js";
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

export interface NotifyRecipientsParams {
  senderId?: string | null;
  requestId?: string | null;
  type?: "status_update" | "payment" | "appointment" | "announcement" | "system";
  title?: string;
  message: string;
}

export interface NotifyOfficeStaffParams extends NotifyRecipientsParams {
  officeId?: string | null;
  officeCode?: string | null;
}

export type NotifyAdminsParams = NotifyRecipientsParams;

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

async function createNotificationsForRecipients(
  recipientIds: string[],
  params: NotifyRecipientsParams,
): Promise<number> {
  if (recipientIds.length === 0) {
    return 0;
  }

  const {
    senderId = null,
    requestId = null,
    type = "system",
    title = "Notification",
    message,
  } = params;

  const rows = recipientIds.map((userId) => ({
    userId,
    senderId,
    requestId,
    type,
    title,
    message,
  }));

  const createdRows = await db
    .insert(notifications)
    .values(rows)
    .returning({ id: notifications.id });

  return createdRows.length;
}

/**
 * Fans out a notification to all active staff members assigned to a specific office.
 */
export async function notifyOfficeStaff(
  params: NotifyOfficeStaffParams,
): Promise<number> {
  const { officeId, officeCode, title = "Office Notification", ...rest } = params;

  // Build match condition for staff in this office
  const matchConditions = [];
  if (officeId) {
    matchConditions.push(eq(users.officeId, officeId));
  }
  if (officeCode) {
    matchConditions.push(eq(users.office, officeCode as any));
  }

  let staffList: Array<{ id: string }> = [];
  if (matchConditions.length > 0) {
    staffList = await db.query.users.findMany({
      where: and(
        eq(users.role, "staff"),
        matchConditions.length === 1 ? matchConditions[0] : or(...matchConditions),
      ),
      columns: { id: true },
    });
  }

  // Fallback to admins if no staff assigned to office
  if (staffList.length === 0) {
    staffList = await db.query.users.findMany({
      where: eq(users.role, "admin"),
      columns: { id: true },
    });
  }

  return createNotificationsForRecipients(
    staffList.map((staff) => staff.id),
    { ...rest, title },
  );
}

/**
 * Fans out a notification to all active administrator accounts.
 */
export async function notifyAdmins(
  params: NotifyAdminsParams,
): Promise<number> {
  const { title = "Admin Notification", ...rest } = params;

  const adminList = await db.query.users.findMany({
    where: and(eq(users.role, "admin"), eq(users.isActive, true)),
    columns: { id: true, role: true, isActive: true },
  });

  const recipientIds = adminList
    .filter(isActiveAdminRecipient)
    .map((admin) => admin.id);

  return createNotificationsForRecipients(recipientIds, { ...rest, title });
}
