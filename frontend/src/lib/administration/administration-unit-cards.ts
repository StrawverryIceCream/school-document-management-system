import {
  matchesUnit,
  type AdministrationUnit,
} from "./administration-units";
import {
  buildQueueSummary,
  type QueueSummary,
} from "@/lib/shared/queue-card";
import type { DocumentRequestWithRelations } from "@/types";

export const CHIP_LABEL = "Administration";
export const ENTER_SUFFIX = "Office";
const PENDING_STATUS = "pending";

export type UnitSummary = QueueSummary;

export function getUnitSummary(
  requests: DocumentRequestWithRelations[],
  unit: AdministrationUnit,
): QueueSummary {
  const pending = requests.filter(
    (request) =>
      request.status === PENDING_STATUS &&
      matchesUnit(
        (request.user as (typeof request.user & { department?: string }) | null)
          ?.department,
        unit,
      ),
  );
  return buildQueueSummary(pending);
}