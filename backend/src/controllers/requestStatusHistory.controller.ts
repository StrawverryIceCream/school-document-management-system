import type { Request, Response } from "express";
import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../db/db.js"; // Adjust import path
import { requestStatusHistory } from "../db/schema.js"; // Adjust import path

// GET /request-status-history
export async function getAllRequestStatusHistory(req: Request, res: Response) {
  try {
    const {
      requestId,
      changedBy,
      fromStatus,
      toStatus,
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

    if (requestId) {
      conditions.push(eq(requestStatusHistory.requestId, requestId as string));
    }

    if (changedBy) {
      conditions.push(eq(requestStatusHistory.changedBy, changedBy as string));
    }

    if (fromStatus) {
      conditions.push(eq(requestStatusHistory.fromStatus, fromStatus as any));
    }

    if (toStatus) {
      conditions.push(eq(requestStatusHistory.toStatus, toStatus as any));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allHistory, totalResult] = await Promise.all([
      db.query.requestStatusHistory.findMany({
        where: whereClause,
        orderBy: (history, { desc }) => [desc(history.createdAt)],
        limit: limitNum,
        offset,
        with: {
          // Assuming you have relations set up for the user and request
          changedByUser: {
            columns: { passwordHash: false },
          },
          request: true,
        },
      }),
      db.select({ total: count() }).from(requestStatusHistory).where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allHistory,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllRequestStatusHistory] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// GET /request-status-history/:id
export async function getRequestStatusHistoryById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const history = await db.query.requestStatusHistory.findFirst({
      where: eq(requestStatusHistory.id, id),
      with: {
        changedByUser: {
          columns: { passwordHash: false },
        },
        request: true,
      },
    });

    if (!history) {
      return res.status(404).json({ error: "Status history record not found" });
    }

    res.json(history);
  } catch (err) {
    console.error("[getRequestStatusHistoryById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// POST /request-status-history
export async function createRequestStatusHistory(req: Request, res: Response) {
  try {
    const { requestId, fromStatus, toStatus, changedBy, note } = req.body;

    if (!requestId || !toStatus) {
      return res.status(400).json({
        error: "Request ID and toStatus are required",
      });
    }

    const [newHistory] = await db
      .insert(requestStatusHistory)
      .values({
        requestId,
        fromStatus: fromStatus || null,
        toStatus,
        changedBy: changedBy || null,
        note: note ? note.trim() : null,
      })
      .returning();

    res.status(201).json(newHistory);
  } catch (err) {
    console.error("[createRequestStatusHistory] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// PATCH /request-status-history/:id
export async function updateRequestStatusHistoryById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;
    const { note } = req.body; 
    // Typically, you only allow updating the note in a history log to fix typos

    const history = await db.query.requestStatusHistory.findFirst({
      where: eq(requestStatusHistory.id, id),
    });

    if (!history) {
      return res.status(404).json({ error: "Status history record not found" });
    }

    const [updatedHistory] = await db
      .update(requestStatusHistory)
      .set({
        ...(note !== undefined && { note: note ? note.trim() : null }),
      })
      .where(eq(requestStatusHistory.id, id))
      .returning();

    res.json(updatedHistory);
  } catch (err) {
    console.error("[updateRequestStatusHistoryById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /request-status-history/:id
export async function deleteRequestStatusHistoryById(
  req: Request<{ id: string }>,
  res: Response
) {
  try {
    const { id } = req.params;

    const history = await db.query.requestStatusHistory.findFirst({
      where: eq(requestStatusHistory.id, id),
    });

    if (!history) {
      return res.status(404).json({ error: "Status history record not found" });
    }

    await db.delete(requestStatusHistory).where(eq(requestStatusHistory.id, id));

    res.json({ message: "Status history record deleted successfully" });
  } catch (err) {
    console.error("[deleteRequestStatusHistoryById] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}