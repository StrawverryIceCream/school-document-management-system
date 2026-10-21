import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/db.js";
import {
  requestRoutingSteps,
  routingStepStatusEnum,
  users,
} from "../db/schema.js";
import { recordAuditLog } from "../services/audit.service.js";

const STEP_STATUSES = routingStepStatusEnum.enumValues;
type RoutingStepStatus = (typeof STEP_STATUSES)[number];

export async function getRequestRoutingSteps(
  req: Request<{ id: string }>,
  res: Response,
) {
  try {
    const requestId = req.params.id;
    if (typeof requestId !== "string") {
      return res.status(400).json({ error: "Invalid request id" });
    }

    const steps = await db.query.requestRoutingSteps.findMany({
      where: (table, { eq }) => eq(table.requestId, requestId),
      with: {
        office: true,
        actedByUser: {
          columns: { id: true, fullName: true, role: true, email: true },
        },
      },
      orderBy: (table, { asc }) => [asc(table.stepOrder)],
    });

    return res.json({ data: steps });
  } catch (err) {
    console.error("[getRequestRoutingSteps] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updateRoutingStepStatus(
  req: Request<
    { id: string; stepId: string },
    unknown,
    { status?: string; remarks?: string }
  >,
  res: Response,
) {
  try {
    const { id: requestId, stepId } = req.params;
    const { status, remarks } = req.body;

    if (!requestId || !stepId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (!status || !(STEP_STATUSES as readonly string[]).includes(status)) {
      return res.status(400).json({
        error: `Invalid status: must be one of ${STEP_STATUSES.join(", ")}`,
      });
    }

    const currentStep = await db.query.requestRoutingSteps.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.id, stepId), eq(table.requestId, requestId)),
    });

    if (!currentStep) {
      return res.status(404).json({ error: "Routing step not found" });
    }

    const callerId = req.session.userId;
    if (!callerId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const caller = await db.query.users.findFirst({
      where: (table, { eq }) => eq(table.id, callerId),
      columns: { role: true, officeId: true },
    });

    if (!caller) {
      return res.status(401).json({ error: "Invalid session" });
    }

    if (caller.role !== "admin" && caller.officeId !== currentStep.officeId) {
      return res.status(403).json({
        error: "You are not authorized to act on routing steps for this office",
      });
    }

    const [updatedStep] = await db
      .update(requestRoutingSteps)
      .set({
        status: status as RoutingStepStatus,
        remarks: remarks?.trim() || null,
        actedBy: req.session.userId ?? null,
        actedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requestRoutingSteps.id, stepId))
      .returning();

    void recordAuditLog({
      actorId: req.session.userId ?? null,
      action: `routing_step.${status}`,
      entityType: "routing_step",
      entityId: stepId,
      metadata: {
        requestId,
        stepOrder: currentStep.stepOrder,
        status,
        remarks,
      },
      ipAddress: req.ip ?? null,
    });

    return res.json(updatedStep);
  } catch (err) {
    console.error("[updateRoutingStepStatus] error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
