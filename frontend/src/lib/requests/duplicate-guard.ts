import { openRequestStatuses, type RequestStatus } from "@/types";

export interface DuplicateCandidate {
  id: string;
  documentTypeId: string;
  referenceNumber: string;
  status: RequestStatus;
  createdAt: string;
  documentName?: string;
}

const OPEN_STATUS_SET = new Set<RequestStatus>(openRequestStatuses);

/** Returns the most recent in-flight request for the given document type, or null if none. */
export function findActiveDuplicateRequest<T extends DuplicateCandidate>(
  requests: readonly T[],
  documentTypeId: string | undefined | null,
): T | null {
  if (!documentTypeId) return null;

  let latest: T | null = null;
  let latestMs = -Infinity;

  for (const req of requests) {
    if (req.documentTypeId !== documentTypeId) continue;
    if (!OPEN_STATUS_SET.has(req.status)) continue;

    const ms = Date.parse(req.createdAt);
    const comparable = Number.isNaN(ms) ? 0 : ms;
    if (!latest || comparable > latestMs) {
      latest = req;
      latestMs = comparable;
    }
  }

  return latest;
}

/** Returns all documentTypeIds that currently have at least one active in-flight request. */
export function getActiveDocumentTypeIds(
  requests: readonly Pick<DuplicateCandidate, "documentTypeId" | "status">[],
): Set<string> {
  const activeIds = new Set<string>();
  for (const req of requests) {
    if (OPEN_STATUS_SET.has(req.status)) {
      activeIds.add(req.documentTypeId);
    }
  }
  return activeIds;
}
