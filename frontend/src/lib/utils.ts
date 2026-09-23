export { cn } from "cn"

import type { RequestStatus } from "@/types";

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

// Shared by any chart that buckets requests by month (PaymentMethodChart,
// WindowsProcessedChart, etc.) so the format only has to be defined once.

/** Sortable bucket key, e.g. "2025-09". */
export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Display label for a month, e.g. "Sep 2025". */
export function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Sortable day-level bucket key, e.g. "2025-09-23". Used by charts that
 * group requests per day rather than per month (e.g. RequestStatusChart). */
export function getDateKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}