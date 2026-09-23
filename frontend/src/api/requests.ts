import type { RequestRow } from "@/types";
import { normalizeRequestRow } from "@/utils/requests";

const REQUEST_ENDPOINTS = [
  "/api/requests",
  "/api/document-requests",
  "/api/documents/requests",
  "/api/registrar/requests",
] as const;

export async function getAllRequests(): Promise<RequestRow[]> {
  for (const endpoint of REQUEST_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { credentials: "include" });

      if (response.status === 404) continue;
      if (!response.ok) {
        throw new Error(`${endpoint} responded ${response.status}`);
      }

      const payload: unknown = await response.json();
      const rows = Array.isArray(payload)
        ? payload
        : isRequestCollection(payload)
          ? payload.data ?? payload.results ?? []
          : [];

      return rows
        .map((item) => normalizeRequestRow(item))
        .filter((item): item is RequestRow => Boolean(item));
    } catch (error) {
      console.warn(`Request endpoint unavailable: ${endpoint}`, error);
    }
  }

  return [];
}

function isRequestCollection(
  value: unknown,
): value is { data?: unknown[]; results?: unknown[] } {
  return Boolean(value && typeof value === "object");
}