import { db } from "../db/db.js";
import {
  documentTypes,
  documentRequests,
  requestRoutingSteps,
  offices,
  type routingStepStatusEnum,
  type routingStepTypeEnum,
} from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";

export type RoutingStepResult = {
  id?: string;
  requestId?: string;
  officeId: string;
  officeCode: string;
  stepOrder: number;
  stepType: (typeof routingStepTypeEnum.enumValues)[number];
  status: (typeof routingStepStatusEnum.enumValues)[number];
  remarks?: string | null;
};

export async function generateRoutingStepsForRequest(
  docCodeOrTypeId: string,
  requestId?: string,
): Promise<RoutingStepResult[]> {
  // 1. Resolve document type
  let docType = await db.query.documentTypes.findFirst({
    where: eq(documentTypes.code, docCodeOrTypeId),
  });
  if (!docType) {
    docType = await db.query.documentTypes.findFirst({
      where: eq(documentTypes.id, docCodeOrTypeId),
    });
  }
  if (!docType) {
    throw new Error(`Document type not found for "${docCodeOrTypeId}"`);
  }

  const template = docType.routingTemplate || [];
  if (template.length === 0) {
    return [];
  }

  // 2. Fetch all offices to map officeCode to officeId
  const allOffices = await db.query.offices.findMany({
    columns: { id: true, code: true },
  });
  const officeMap = new Map(allOffices.map((o) => [o.code, o.id]));

  // Find lowest step order to mark as initially pending
  const minStepOrder = Math.min(...template.map((t) => t.stepOrder));

  const stepsToInsert: RoutingStepResult[] = [];
  for (const t of template) {
    const officeId = officeMap.get(t.officeCode);
    if (!officeId) {
      console.warn(`Routing step office "${t.officeCode}" not found`);
      continue;
    }
    const initialStatus = t.stepOrder === minStepOrder ? "pending" : "locked";
    stepsToInsert.push({
      requestId,
      officeId,
      officeCode: t.officeCode,
      stepOrder: t.stepOrder,
      stepType: t.stepType as any,
      status: initialStatus,
    });
  }

  // 3. If requestId provided, persist to DB
  if (requestId && stepsToInsert.length > 0) {
    const inserted = await db
      .insert(requestRoutingSteps)
      .values(
        stepsToInsert.map((s) => ({
          requestId,
          officeId: s.officeId,
          stepOrder: s.stepOrder,
          stepType: s.stepType,
          status: s.status,
        })),
      )
      .returning();

    return inserted.map((row) => {
      const matched = stepsToInsert.find(
        (s) => s.officeId === row.officeId && s.stepOrder === row.stepOrder,
      );
      return {
        id: row.id,
        requestId: row.requestId,
        officeId: row.officeId,
        officeCode: matched?.officeCode || "",
        stepOrder: row.stepOrder,
        stepType: row.stepType,
        status: row.status,
        remarks: row.remarks,
      };
    });
  }

  return stepsToInsert;
}

export async function completeRoutingStep(params: {
  stepId: string;
  status: "approved" | "action_required" | "rejected";
  remarks?: string;
  staffUserId?: string;
}) {
  const { stepId, status, remarks, staffUserId } = params;

  // Run in transaction to prevent parallel race conditions
  return await db.transaction(async (tx) => {
    // 1. Fetch current step
    const currentStep = await tx.query.requestRoutingSteps.findFirst({
      where: eq(requestRoutingSteps.id, stepId),
    });
    if (!currentStep) {
      throw new Error(`Routing step with ID "${stepId}" not found`);
    }

    // 2. Lock parent document request row with SELECT ... FOR UPDATE
    await tx.execute(
      sql`SELECT id FROM document_requests WHERE id = ${currentStep.requestId} FOR UPDATE`,
    );

    // 3. Update the step
    const [updatedStep] = await tx
      .update(requestRoutingSteps)
      .set({
        status,
        remarks: remarks || null,
        actedBy: staffUserId || null,
        actedAt: new Date(),
      })
      .where(eq(requestRoutingSteps.id, stepId))
      .returning();

    // 4. State transitions
    if (status === "approved") {
      // Check if all steps at current stepOrder are approved
      const siblingSteps = await tx.query.requestRoutingSteps.findMany({
        where: and(
          eq(requestRoutingSteps.requestId, currentStep.requestId),
          eq(requestRoutingSteps.stepOrder, currentStep.stepOrder),
        ),
      });

      const allApproved = siblingSteps.every((s) => s.status === "approved");
      if (allApproved) {
        // Unlock next stepOrder
        await tx
          .update(requestRoutingSteps)
          .set({ status: "pending" })
          .where(
            and(
              eq(requestRoutingSteps.requestId, currentStep.requestId),
              eq(requestRoutingSteps.stepOrder, currentStep.stepOrder + 1),
              eq(requestRoutingSteps.status, "locked"),
            ),
          );
      }
    } else if (status === "action_required") {
      // Non-destructive deficiency hold on parent
      await tx
        .update(documentRequests)
        .set({ status: "on_hold" })
        .where(eq(documentRequests.id, currentStep.requestId));
    } else if (status === "rejected") {
      // Reject request
      await tx
        .update(documentRequests)
        .set({ status: "rejected" })
        .where(eq(documentRequests.id, currentStep.requestId));
    }

    return updatedStep;
  });
}
