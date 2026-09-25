import type { Request, Response } from "express";
import { db } from "../db/db.js";
import { documentRequests } from "../db/schema.js";
import { and, count, eq, ilike, or } from "drizzle-orm";

const STATUSES = [
  "pending",
  "processing",
  "ready",
  "claimed",
  "cancelled",
] as const;
type RequestStatus = (typeof STATUSES)[number];

interface GetRequestsQuery {
  search?: string;
  status?: string;
  userId?: string;
  page?: string;
  limit?: string;
}

export async function getAllRequests(
  req: Request<unknown, unknown, unknown, GetRequestsQuery>,
  res: Response,
) {
  try {
    const {
      search,
      status,
      userId,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string, 10) || 20),
    );
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(documentRequests.purpose, `%${search}%`),
          ilike(documentRequests.staffNotes, `%${search}%`),
        ),
      );
    }

    if (status && STATUSES.includes(status as RequestStatus)) {
      conditions.push(
        eq(documentRequests.status, status as RequestStatus),
      );
    }

    if (userId) {
      conditions.push(eq(documentRequests.userId, userId));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const [allRequests, totalResult] = await Promise.all([
      db.query.documentRequests.findMany({
        where: whereClause,
        with: {
          user: {
            columns: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          documentType: true,
        },
        orderBy: (documentRequests, { desc }) => [
          desc(documentRequests.createdAt),
        ],
        limit: limitNum,
        offset,
      }),
      db
        .select({ total: count() })
        .from(documentRequests)
        .where(whereClause),
    ]);

    const total = totalResult?.[0]?.total ?? 0;

    res.json({
      data: allRequests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getAllRequests] error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getRequestById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;

    const request = await db.query.documentRequests.findFirst({
      where: eq(documentRequests.id, id),
      with: {
        user: {
          columns: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        documentType: true,
        payments: true,
      },
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    return res.json(request);
  } catch (err) {
    console.error("[getRequestById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}