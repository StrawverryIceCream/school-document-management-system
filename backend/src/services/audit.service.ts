import { db } from "../db/db.js";
import { auditLogs } from "../db/schema.js";

export type AuditCategory = "request" | "payment" | "account" | "document";

export interface RecordAuditLogParams {
  actorId?: string | null | undefined;
  action: string;
  entityType: AuditCategory | string;
  entityId?: string | null | undefined;
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string | null | undefined;
}

export async function recordAuditLog(
  params: RecordAuditLogParams,
): Promise<string | null> {
  try {
    const [inserted] = await db
      .insert(auditLogs)
      .values({
        actorId: params.actorId ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId ?? null,
        metadata: params.metadata ?? {},
        ipAddress: params.ipAddress ?? null,
      })
      .returning({ id: auditLogs.id });

    return inserted?.id ?? null;
  } catch (err) {
    console.error("[recordAuditLog] error:", err);
    return null;
  }
}
