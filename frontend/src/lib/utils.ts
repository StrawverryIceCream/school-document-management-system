export { cn } from "cn";
import { useLocation } from "react-router-dom";
import type { DocumentRequestWithRelations, RequestStatus } from "@/types";
import type { DashboardStats, RequestRow } from "@/context/DashboardContext";

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

// Tailwind classes per request status, used for the colored status badge in
// RequestTable. Adjust one status's colors here without affecting the others.
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
// Converts one raw row from the real /api/requests endpoint into the shape
// the dashboard UI understands. Fields the current backend doesn't provide
// (college, window) are left undefined on purpose — components that rely on
// them will fall back to their own "no data yet" states.
export function normalizeRequestRow(raw: DocumentRequestWithRelations): RequestRow {
  const paymentMethod =
    raw.payment?.method === "cash" || raw.payment?.method === "online"
      ? raw.payment.method
      : undefined;

  return {
    id: String(raw.id),
    applicant: raw.user?.fullName ?? "Unknown applicant",
    document: raw.documentType?.name ?? "Unknown document",
    status: raw.status,
    submittedAt: raw.createdAt ? new Date(raw.createdAt).toISOString() : null,
    releaseDate: raw.releaseDate,
    claimedAt: raw.claimedAt ? new Date(raw.claimedAt).toISOString() : null,
    purpose: raw.purpose,
    paymentMethod,
    college: undefined, // not in the current schema
    course: undefined, 
    section: undefined, 
    feeRequired: raw.documentType ? Number(raw.documentType.fee) > 0 : undefined,
  };
}

// Computed from whatever request rows we already have, rather than calling
// a separate /stats endpoint that doesn't exist yet.
export function buildStatsFromRequests(requests: RequestRow[]): DashboardStats {
  const stats: DashboardStats = {
    pending: 0,
    processing: 0,
    ready: 0,
    claimed: 0,
    rejected: 0,
  };

  for (const req of requests) {
    if (req.status in stats) {
      stats[req.status as keyof DashboardStats] += 1;
    }
  }

  return stats;
}