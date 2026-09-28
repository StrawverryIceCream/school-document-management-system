import type { Request, Response } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { documentRequests, notifications, users } from "../db/schema.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const TITLE_MAX_LENGTH = 100;
const MESSAGE_MAX_LENGTH = 1000;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const SENDER_COLUMNS = { id: true, fullName: true, role: true } as const;

function getSessionUserId(req: Request): string | undefined {
  return req.session.userId;
}

export async function getMyNotifications(req: Request, res: Response) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { isRead, page, limit } = req.query;

    const pageNum = Math.max(
      DEFAULT_PAGE,
      parseInt(page as string, 10) || DEFAULT_PAGE,
    );
    const limitNum = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(limit as string, 10) || DEFAULT_LIMIT),
    );
    const offset = (pageNum - 1) * limitNum;

    const conditions = [eq(notifications.userId, userId)];

    if (isRead !== undefined) {
      conditions.push(eq(notifications.isRead, isRead === "true"));
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
      db.query.notifications.findMany({
        where: whereClause,
        with: { sender: { columns: SENDER_COLUMNS } },
        orderBy: [desc(notifications.createdAt)],
        limit: limitNum,
        offset,
      }),
      db.select({ total: count() }).from(notifications).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    return res.json({
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getMyNotifications] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [result] = await db
      .select({ total: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      );

    return res.json({ unread: result?.total ?? 0 });
  } catch (err) {
    console.error("[getUnreadCount] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function sendNotification(req: Request, res: Response) {
  try {
    const senderId = getSessionUserId(req);
    if (!senderId) return res.status(401).json({ error: "Unauthorized" });

    const { userId, requestId, title, message } = req.body;

    if (typeof userId !== "string" || !UUID_REGEX.test(userId)) {
      return res.status(400).json({ error: "A valid userId is required" });
    }

    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    if (!trimmedMessage || trimmedMessage.length > MESSAGE_MAX_LENGTH) {
      return res.status(400).json({
        error: `Message is required and must be at most ${MESSAGE_MAX_LENGTH} characters`,
      });
    }

    const trimmedTitle = typeof title === "string" ? title.trim() : "";
    if (title !== undefined && trimmedTitle.length > TITLE_MAX_LENGTH) {
      return res.status(400).json({
        error: `Title must be at most ${TITLE_MAX_LENGTH} characters`,
      });
    }

    if (
      requestId !== undefined &&
      requestId !== null &&
      (typeof requestId !== "string" || !UUID_REGEX.test(requestId))
    ) {
      return res.status(400).json({ error: "requestId must be a valid id" });
    }

    const recipient = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { id: true },
    });

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    if (requestId) {
      const request = await db.query.documentRequests.findFirst({
        where: eq(documentRequests.id, requestId),
        columns: { id: true },
      });

      if (!request) {
        return res.status(404).json({ error: "Document request not found" });
      }
    }

    const [created] = await db
      .insert(notifications)
      .values({
        userId,
        senderId,
        requestId: requestId ?? null,
        ...(trimmedTitle ? { title: trimmedTitle } : {}),
        message: trimmedMessage,
      })
      .returning();

    if (!created) {
      return res.status(500).json({ error: "Failed to send notification" });
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error("[sendNotification] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function markAsRead(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    // Filtering by userId too so nobody can touch another user's notification
    const [updated] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.json(updated);
  } catch (err) {
    console.error("[markAsRead] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const updated = await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
      )
      .returning({ id: notifications.id });

    return res.json({ updated: updated.length });
  } catch (err) {
    console.error("[markAllAsRead] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteNotification(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const userId = getSessionUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { id } = req.params;

    const deleted = await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning({ id: notifications.id });

    if (deleted.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    console.error("[deleteNotification] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}