import {
  matchesUnit,
  type AdministrationUnit,
} from "@/lib/administration-units";
import type { Tone } from "@/lib/tones";
import type { DocumentRequestWithRelations } from "@/types";

export const LOW_LOAD_MAX_PENDING = 5;
export const MAX_HIGHLIGHTS = 3;
export const HIGHLIGHTS_LABEL = "Queue highlights";
export const NO_PENDING_LABEL = "No pending documents";
const PENDING_STATUS = "pending";

export const CHIP_LABEL = "Administration";
export const ENTER_SUFFIX = "Office";
const UNKNOWN_DOCUMENT_LABEL = "Other";

export type UnitSummary = {
  pendingLabel: string;
  tone: Tone;
  highlights: string[];
};

export function getUnitSummary(
  requests: DocumentRequestWithRelations[],
  unit: AdministrationUnit,
): UnitSummary {
  const pending = requests.filter(
    (request) =>
      request.status === PENDING_STATUS &&
      matchesUnit(
        (request.user as (typeof request.user & { department?: string }) | null)
          ?.department,
        unit,
      ),
  );

  const counts = new Map<string, number>();
  for (const request of pending) {
    const label =
      request.documentType?.code ??
      request.documentType?.name ??
      UNKNOWN_DOCUMENT_LABEL;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const highlights = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_HIGHLIGHTS)
    .map(([label, count]) => `${label} (${count})`);

  let tone: Tone = "amber";
  if (pending.length === 0) tone = "neutral";
  else if (pending.length <= LOW_LOAD_MAX_PENDING) tone = "emerald";

  return {
    pendingLabel: `${pending.length} Pending ${
      pending.length === 1 ? "Request" : "Requests"
    }`,
    tone,
    highlights,
  };
}