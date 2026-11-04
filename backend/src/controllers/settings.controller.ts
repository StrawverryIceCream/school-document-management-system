import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { systemSettings } from "../db/schema.js";
import { DEFAULT_ACADEMIC_TERM } from "../lib/term-standing.js";
import { recordAuditLog } from "../services/audit.service.js";

export async function getActiveAcademicTerm(): Promise<string> {
  try {
    const setting = await db.query.systemSettings.findFirst({
      where: eq(systemSettings.key, "activeAcademicTerm"),
      columns: { value: true },
    });
    return setting?.value?.trim() || DEFAULT_ACADEMIC_TERM;
  } catch (error) {
    console.error("[getActiveAcademicTerm] Error fetching active academic term:", error);
    return DEFAULT_ACADEMIC_TERM;
  }
}

export async function getSettings(_req: Request, res: Response) {
  try {
    const activeAcademicTerm = await getActiveAcademicTerm();
    return res.json({ activeAcademicTerm });
  } catch (error) {
    console.error("[getSettings] error:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const rawTerm = req.body?.activeAcademicTerm;
    if (typeof rawTerm !== "string" || !rawTerm.trim()) {
      return res.status(400).json({ error: "Active academic term is required." });
    }
    const activeAcademicTerm = rawTerm.trim();
    if (activeAcademicTerm.length > 50) {
      return res.status(400).json({
        error: "Active academic term must be 50 characters or fewer.",
      });
    }

    await db
      .insert(systemSettings)
      .values({
        key: "activeAcademicTerm",
        value: activeAcademicTerm,
        updatedBy: req.session.userId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: systemSettings.key,
        set: {
          value: activeAcademicTerm,
          updatedBy: req.session.userId,
          updatedAt: new Date(),
        },
      });

    await recordAuditLog({
      actorId: req.session.userId,
      action: "settings.updated",
      entityType: "account",
      entityId: "activeAcademicTerm",
      metadata: { activeAcademicTerm },
    });

    return res.json({ activeAcademicTerm });
  } catch (error) {
    console.error("[updateSettings] error:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
}
