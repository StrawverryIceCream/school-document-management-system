import type { DashboardStats, RequestRow } from "@/context/DashboardContext";

export function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function getDateKey(value: string | Date) {
  return new Date(value).toISOString().slice(0, 10);
}

// Computed from whatever request rows we already have, rather than calling
// a separate /stats endpoint that doesn't exist yet.
export function buildStatsFromRequests(requests: RequestRow[]): DashboardStats {
  const stats: DashboardStats = {
    pending: 0,
    processing: 0,
    ready: 0,
    claimed: 0,
    cancelled: 0,
  };

  for (const req of requests) {
    if (req.status in stats) {
      stats[req.status as keyof DashboardStats] += 1;
    }
  }

  return stats;
}