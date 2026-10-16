import type { Request, Response } from "express";
import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/db.js"; // Adjust import path
import { announcements } from "../db/schema.js"; // Adjust import path

// GET /announcements
export async function getAllAnnouncements(req: Request, res: Response) {
  try {
    const {
      search,
      audience,
      isPinned,
      createdById,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20)
    );
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(announcements.title, `%${search}%`),
          ilike(announcements.body, `%${search}%`)
        )
      );
    }

    if (audience) {
      conditions.push(eq(announcements.audience, audience as any));
    }

    if (isPinned !== undefined) {
      conditions.push(eq(announcements.isPinned, isPinned === "true"));
    }

    if (createdById) {
      conditions.push(eq(announcements.createdBy, createdById as string));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allAnnouncements, totalResult] = await Promise.all([
      db.query.announcements.findMany({
        where: whereClause,
        // Order by pinned announcements first, then by the most recently published/created
        orderBy: (announcements, { desc }) => [
          desc(announcements.isPinned),
          desc(announcements.publishedAt),
          desc(announcements.createdAt),
        ],
        limit: limitNum,
        offset,
        with: {
          // Assumes you have a relation setup in your schema pointing to the user who created it
          author: { 
            columns: { passwordHash: false } 
          }
        },
      }),
      db.select({ total: count() }).from(announcements).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allAnnouncements,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllAnnouncements] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /announcements/:id
export async function getAnnouncementById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const announcement = await db.query.announcements.findFirst({
      where: eq(announcements.id, id),
      with: {
        author: {
          columns: { passwordHash: false },
        },
      },
    });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(announcement);
  } catch (err) {
    console.error("[getAnnouncementById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /announcements
export async function createAnnouncement(req: Request, res: Response) {
  try {
    const {
      title,
      body,
      audience,
      isPinned,
      publishedAt,
      expiresAt,
      createdBy,
    } = req.body;

    if (!title || !body || !createdBy) {
      return res.status(400).json({
        error: "Title, body, and createdBy are required",
      });
    }

    const pubDate = publishedAt ? new Date(publishedAt) : null;
    const expDate = expiresAt ? new Date(expiresAt) : null;

    // Manual validation to mirror the database CHECK constraint
    if (pubDate && expDate && expDate <= pubDate) {
      return res.status(400).json({
        error: "Expiration date must be after the publication date",
      });
    }

    const [newAnnouncement] = await db
      .insert(announcements)
      .values({
        title: title.trim(),
        body: body.trim(),
        audience: audience || null,
        isPinned: isPinned !== undefined ? Boolean(isPinned) : false,
        publishedAt: pubDate,
        expiresAt: expDate,
        createdBy, // Ideally, you could also pull this directly from req.user!.id if using auth middleware
      })
      .returning();

    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error("[createAnnouncement] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /announcements/:id
export async function updateAnnouncementById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const { title, body, audience, isPinned, publishedAt, expiresAt } = req.body;

    const announcement = await db.query.announcements.findFirst({
      where: eq(announcements.id, id),
    });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    // Determine the new dates for validation
    const targetPubDate = publishedAt !== undefined ? (publishedAt ? new Date(publishedAt) : null) : announcement.publishedAt;
    const targetExpDate = expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : announcement.expiresAt;

    if (targetPubDate && targetExpDate && targetExpDate <= targetPubDate) {
      return res.status(400).json({
        error: "Expiration date must be after the publication date",
      });
    }

    const [updatedAnnouncement] = await db
      .update(announcements)
      .set({
        ...(title && { title: title.trim() }),
        ...(body && { body: body.trim() }),
        ...(audience !== undefined && { audience }), // allows setting to null
        ...(isPinned !== undefined && { isPinned: Boolean(isPinned) }),
        ...(publishedAt !== undefined && { publishedAt: targetPubDate }),
        ...(expiresAt !== undefined && { expiresAt: targetExpDate }),
        updatedAt: new Date(),
      })
      .where(eq(announcements.id, id))
      .returning();

    res.json(updatedAnnouncement);
  } catch (err) {
    console.error("[updateAnnouncementById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /announcements/:id
export async function deleteAnnouncementById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const announcement = await db.query.announcements.findFirst({
      where: eq(announcements.id, id),
    });

    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    await db.delete(announcements).where(eq(announcements.id, id));

    res.json({ message: "Announcement deleted successfully" });
  } catch (err) {
    console.error("[deleteAnnouncementById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}