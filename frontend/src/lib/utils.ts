export { cn } from "cn"

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