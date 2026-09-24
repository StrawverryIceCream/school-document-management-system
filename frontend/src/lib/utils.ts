export { cn } from "cn";
import { useLocation } from "react-router-dom";
import type { RequestRow } from "@/types";
import type { RequestStatus } from "@/types";

export const statusStyles: Record<RequestStatus, string> = {
  pending:
    "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20",
  processing:
    "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20",
  ready:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  claimed:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  rejected:
    "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function getDateKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
}

export function formatStudentId(value: string): string {
  const digits = value
    .replace(/^TUPM-?/, "")
    .replace(/\D/g, "")
    .slice(0, 6);

  let formatted = "TUPM-";
  if (digits.length > 0) formatted += digits.slice(0, 2);
  if (digits.length > 2) formatted += `-${digits.slice(2, 6)}`;
  return formatted;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return (firstName[0] + lastName[0]).toUpperCase();
}

export function useCurrentRouteLabel() {
  const location = useLocation();
  const segment =
    location.pathname.split("/").filter(Boolean).pop() || "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function normalizeStatus(
  value: string | null | undefined,
): RequestRow["status"] {
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
    record.id ??
      record.requestId ??
      record.request_id ??
      record.requestNumber ??
      "unknown",
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
    createdAt:
      getString(record, "createdAt") ??
      getString(record, "submittedAt") ??
      null,
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



export const TIME_RANGES = [
  { value: "90d", label: "Last 3 months", days: 90 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "7d", label: "Last 7 days", days: 7 },
] as const;

export type TimeRange = (typeof TIME_RANGES)[number]["value"];

export const DEFAULT_TIME_RANGE: TimeRange = "90d";

export interface DailyCounts {
  date: string; // "YYYY-MM-DD" in local time
  submitted: number;
  claimed: number;
}

export function isTimeRange(value: string): value is TimeRange {
  return TIME_RANGES.some((range) => range.value === value);
}


export function formatChartDate(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function buildDailyCounts(requests: RequestRow[]): DailyCounts[] {
  const counts = new Map<string, DailyCounts>();

  const bump = (dateKey: string, field: "submitted" | "claimed") => {
    const existing = counts.get(dateKey) ?? {
      date: dateKey,
      submitted: 0,
      claimed: 0,
    };
    existing[field] += 1;
    counts.set(dateKey, existing);
  };

  for (const req of requests) {
    if (req.submittedAt) bump(getDateKey(req.submittedAt), "submitted");
    //if (req.claimedAt) bump(getDateKey(req.claimedAt), "claimed");
  }

  return Array.from(counts.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function filterByTimeRange(
  dailyCounts: DailyCounts[],
  timeRange: TimeRange,
): DailyCounts[] {
  if (dailyCounts.length === 0) return [];

  const days =
    TIME_RANGES.find((range) => range.value === timeRange)?.days ??
    TIME_RANGES[0].days;

  // Anchor to the latest data point so older or sparse datasets still render
  const latest = dailyCounts[dailyCounts.length - 1].date;
  const startDate = new Date(`${latest}T00:00:00`);
  startDate.setDate(startDate.getDate() - days);
  const startKey = getDateKey(startDate.toISOString());

  return dailyCounts.filter((item) => item.date >= startKey);
}