import type { Request, Response } from "express";
import {
  and,
  count,
  countDistinct,
  desc,
  eq,
  ilike,
  not,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../db/db.js";
import { auditLogs, users } from "../db/schema.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 100;
const LOG_TYPES = ["request", "payment", "account", "document"] as const;
type LogType = (typeof LOG_TYPES)[number];

function getQueryString(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function getLogType(entityType: string): string {
  const normalized = entityType.toLowerCase();
  if (normalized.includes("request")) return "request";
  if (normalized.includes("payment")) return "payment";
  if (normalized.includes("document")) return "document";
  if (normalized.includes("account") || normalized.includes("user")) {
    return "account";
  }
  return normalized;
}

function getLogTypeCondition(type: LogType) {
  if (type === "account") {
    return or(
      ilike(auditLogs.entityType, "%account%"),
      ilike(auditLogs.entityType, "%user%"),
    );
  }

  if (type === "document") {
    return and(
      ilike(auditLogs.entityType, "%document%"),
      not(ilike(auditLogs.entityType, "%request%")),
    );
  }

  return ilike(auditLogs.entityType, `%${type}%`);
}

export async function getLogs(req: Request, res: Response) {
  try {
    const pageQuery = getQueryString(req.query.page);
    const limitQuery = getQueryString(req.query.limit);
    const search = getQueryString(req.query.search);
    const type = getQueryString(req.query.type);

    if (type && !LOG_TYPES.includes(type as LogType)) {
      return res.status(400).json({
        error: `type must be one of: ${LOG_TYPES.join(", ")}`,
      });
    }

    const pageNum = Math.max(
      DEFAULT_PAGE,
      Number.parseInt(pageQuery ?? "", 10) || DEFAULT_PAGE,
    );
    const limitNum = Math.min(
      MAX_LIMIT,
      Math.max(
        1,
        Number.parseInt(limitQuery ?? "", 10) || DEFAULT_LIMIT,
      ),
    );
    const offset = (pageNum - 1) * limitNum;
    const conditions = [];

    if (type) {
      conditions.push(getLogTypeCondition(type as LogType));
    }

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          sql`${auditLogs.id}::text ilike ${pattern}`,
          ilike(auditLogs.action, pattern),
          ilike(auditLogs.entityType, pattern),
          ilike(users.fullName, pattern),
          ilike(users.studentId, pattern),
        ),
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const actorJoin = eq(auditLogs.actorId, users.id);

    const [rows, totalResult] = await Promise.all([
      db
        .select({
          id: auditLogs.id,
          actorId: auditLogs.actorId,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          createdAt: auditLogs.createdAt,
          accountName: users.fullName,
          accountRole: users.role,
          accountStudentId: users.studentId,
        })
        .from(auditLogs)
        .leftJoin(users, actorJoin)
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limitNum)
        .offset(offset),
      db
        .select({ total: count() })
        .from(auditLogs)
        .leftJoin(users, actorJoin)
        .where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;

    return res.json({
      data: rows.map((log) => ({
        id: log.id,
        userId: log.actorId ?? "system",
        type: getLogType(log.entityType),
        message: log.action,
        createdAt: log.createdAt,
        accountName: log.accountName ?? "System",
        accountRole: log.accountRole ?? "system",
        accountStudentId: log.accountStudentId,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error("[getLogs] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getLogStats(_req: Request, res: Response) {
  try {
    const [[stats], [latestLog]] = await Promise.all([
      db
        .select({
          total: count(),
          activeAccounts: countDistinct(auditLogs.actorId),
        })
        .from(auditLogs),
      db
        .select({ createdAt: auditLogs.createdAt })
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(1),
    ]);

    return res.json({
      total: stats?.total ?? 0,
      activeAccounts: stats?.activeAccounts ?? 0,
      lastActivityAt: latestLog?.createdAt ?? null,
    });
  } catch (err) {
    console.error("[getLogStats] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getLogById(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const { id } = req.params;
    const [log] = await db
      .select({
        id: auditLogs.id,
        actorId: auditLogs.actorId,
        action: auditLogs.action,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        metadata: auditLogs.metadata,
        ipAddress: auditLogs.ipAddress,
        createdAt: auditLogs.createdAt,
        actor: {
          id: users.id,
          fullName: users.fullName,
          studentId: users.studentId,
          role: users.role,
        },
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorId, users.id))
      .where(eq(auditLogs.id, id))
      .limit(1);

    if (!log) {
      return res.status(404).json({ error: "Audit log not found" });
    }

    return res.json(log);
  } catch (err) {
    console.error("[getLogById] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
