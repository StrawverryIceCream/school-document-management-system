import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { systemSettings } from "../db/schema.js";
import { DEFAULT_ACADEMIC_TERM } from "../lib/term-standing.js";
import { recordAuditLog } from "../services/audit.service.js";

export const DEFAULT_SYSTEM_VERSION = "v1.0.0";
export const DEFAULT_SYSTEM_VERSION_LABEL = "v1.0 System";

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

export async function getSystemSettingsMap(): Promise<Record<string, string>> {
  try {
    const all = await db.query.systemSettings.findMany();
    const map: Record<string, string> = {};
    for (const row of all) {
      if (row.key && row.value) {
        map[row.key] = row.value.trim();
      }
    }
    return map;
  } catch (error) {
    console.error("[getSystemSettingsMap] Error fetching settings map:", error);
    return {};
  }
}

export async function getSettings(_req: Request, res: Response) {
  try {
    const map = await getSystemSettingsMap();
    const activeAcademicTerm = map.activeAcademicTerm || DEFAULT_ACADEMIC_TERM;
    const systemVersion = map.systemVersion || DEFAULT_SYSTEM_VERSION;
    const systemVersionLabel = map.systemVersionLabel || DEFAULT_SYSTEM_VERSION_LABEL;

    return res.json({
      activeAcademicTerm,
      systemVersion,
      systemVersionLabel,
    });
  } catch (error) {
    console.error("[getSettings] error:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
}

export async function updateSettings(req: Request, res: Response) {
  try {
    const { activeAcademicTerm, systemVersion, systemVersionLabel } = req.body ?? {};
    const updates: Record<string, string> = {};

    if (activeAcademicTerm !== undefined) {
      if (typeof activeAcademicTerm !== "string" || !activeAcademicTerm.trim()) {
        return res.status(400).json({ error: "Active academic term cannot be empty." });
      }
      if (activeAcademicTerm.trim().length > 50) {
        return res.status(400).json({
          error: "Active academic term must be 50 characters or fewer.",
        });
      }
      updates.activeAcademicTerm = activeAcademicTerm.trim();
    }

    if (systemVersion !== undefined) {
      if (typeof systemVersion !== "string" || !systemVersion.trim()) {
        return res.status(400).json({ error: "System version cannot be empty." });
      }
      if (systemVersion.trim().length > 50) {
        return res.status(400).json({
          error: "System version must be 50 characters or fewer.",
        });
      }
      updates.systemVersion = systemVersion.trim();
    }

    if (systemVersionLabel !== undefined) {
      if (typeof systemVersionLabel !== "string" || !systemVersionLabel.trim()) {
        return res.status(400).json({ error: "System version label cannot be empty." });
      }
      if (systemVersionLabel.trim().length > 50) {
        return res.status(400).json({
          error: "System version label must be 50 characters or fewer.",
        });
      }
      updates.systemVersionLabel = systemVersionLabel.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid settings provided to update." });
    }

    for (const [key, value] of Object.entries(updates)) {
      await db
        .insert(systemSettings)
        .values({
          key,
          value,
          updatedBy: req.session.userId,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: {
            value,
            updatedBy: req.session.userId,
            updatedAt: new Date(),
          },
        });

      await recordAuditLog({
        actorId: req.session.userId,
        action: `settings.updated.${key}`,
        entityType: "account",
        entityId: key,
        metadata: { key, value },
      });
    }

    const currentMap = await getSystemSettingsMap();
    return res.json({
      activeAcademicTerm: currentMap.activeAcademicTerm || DEFAULT_ACADEMIC_TERM,
      systemVersion: currentMap.systemVersion || DEFAULT_SYSTEM_VERSION,
      systemVersionLabel: currentMap.systemVersionLabel || DEFAULT_SYSTEM_VERSION_LABEL,
    });
  } catch (error) {
    console.error("[updateSettings] error:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
}
