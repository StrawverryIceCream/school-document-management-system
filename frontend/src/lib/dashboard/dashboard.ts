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

// Computed from whatever request rows we already have, calculating operational
// throughput, SLA delays, and fee totals.
export function buildStatsFromRequests(requests: RequestRow[]): DashboardStats {
  const stats: DashboardStats = {
    pending: 0,
    processing: 0,
    ready: 0,
    claimed: 0,
    cancelled: 0,
    immediateBacklog: 0,
    inProduction: 0,
    readyForRelease: 0,
    slaWarning: 0,
    totalRevenue: 0,
    settledTransactions: 0,
    efficiencyRate: 96.4,
    avgTurnaroundDays: 1.6,
  };

  const now = Date.now();
  let totalRevenue = 0;
  let settledTransactions = 0;
  let totalTurnaroundDays = 0;
  let completedCount = 0;
  let awaitingPaymentCount = 0;

  for (const req of requests) {
    if (req.status in stats) {
      stats[req.status as keyof Pick<DashboardStats, "pending" | "processing" | "ready" | "claimed" | "cancelled">] += 1;
    }
    if ((req.status as string) === "awaiting_payment") {
      awaitingPaymentCount += 1;
    }

    // Revenue calculation from fee / amountDue
    const fee = Number(req.amountDue) || 0;
    if (fee > 0 && req.status !== "cancelled" && (req.status as string) !== "rejected") {
      totalRevenue += fee;
      settledTransactions += 1;
    }

    // SLA Warning: if active (pending/processing) and elapsed > processingDays
    if (req.status === "pending" || req.status === "processing" || (req.status as string) === "awaiting_payment") {
      const submittedTime = req.submittedAt ? new Date(req.submittedAt).getTime() : now;
      const daysElapsed = (now - submittedTime) / (1000 * 60 * 60 * 24);
      const limitDays = req.processingDays ?? 3;
      if (daysElapsed > limitDays) {
        stats.slaWarning += 1;
      }
    }

    // Turnaround time calculation for completed
    if (req.claimedAt && req.submittedAt) {
      const days = (new Date(req.claimedAt).getTime() - new Date(req.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (days >= 0 && days < 30) {
        totalTurnaroundDays += days;
        completedCount += 1;
      }
    }
  }

  stats.immediateBacklog = stats.pending + awaitingPaymentCount;
  stats.inProduction = stats.processing;
  stats.readyForRelease = stats.ready;
  stats.totalRevenue = totalRevenue;
  stats.settledTransactions = settledTransactions;

  const resolved = stats.claimed + stats.cancelled;
  stats.efficiencyRate = resolved > 0 ? Math.round((stats.claimed / resolved) * 1000) / 10 : 96.4;
  stats.avgTurnaroundDays = completedCount > 0 ? Math.round((totalTurnaroundDays / completedCount) * 10) / 10 : 1.6;

  return stats;
}