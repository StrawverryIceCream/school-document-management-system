import type { RequestRow } from "@/types";

function normalizeStatus(value: string | null | undefined): RequestRow["status"] {
  switch (value?.toLowerCase()) {
    case "pending":
      return "pending";
    case "processing":
    case "in-progress":
      return "processing";
    case "ready":
      return "ready";
    case "claimed":
      return "claimed";
    case "cancelled":
    case "rejected":
      return "cancelled";
    default:
      return "pending";
  }
}

export function normalizeRequestRow(raw: unknown): RequestRow | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const user = asRecord(record.user);
  const documentType = asRecord(record.documentType);
  const document = asRecord(record.document);
  const documentTypeAlt = asRecord(record.document_type);
  const windowData = asRecord(record.window);

  const id = String(
    record.id ?? record.requestId ?? record.request_id ?? record.requestNumber ?? "unknown",
  );
  const applicant =
    getString(user, "fullName") ??
    getString(user, "full_name") ??
    getString(record, "applicantName") ??
    getString(record, "studentName") ??
    getString(user, "email") ??
    "Unknown applicant";
  const documentName =
    getString(documentType, "name") ??
    getString(document, "name") ??
    getString(record, "documentName") ??
    getString(documentTypeAlt, "name") ??
    "Unknown document";

  return {
    id,
    applicant,
    document: documentName,
    college:
      getString(record, "college") ??
      getString(record, "collegeName") ??
      getString(user, "college") ??
      getString(user, "collegeName") ??
      null,
    window:
      getString(record, "window") ??
      getString(record, "windowName") ??
      getString(windowData, "name") ??
      null,
    submittedAt:
      getString(record, "createdAt") ??
      getString(record, "submittedAt") ??
      getString(record, "requestedAt") ??
      null,
    status: normalizeStatus(getString(record, "status")),
    purpose: getString(record, "purpose") ?? getString(record, "notes") ?? null,
    createdAt: getString(record, "createdAt") ?? getString(record, "submittedAt") ?? null,
  };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function getString(
  record: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = record?.[key];
  return typeof value === "string" && value ? value : undefined;
}