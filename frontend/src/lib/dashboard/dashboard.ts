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

export const SECTOR_LABELS: Record<string, string> = {
  OVPAA: "Academic Affairs",
  OVPAF: "Administration & Finance",
  OVPRE: "Research & Extension",
  OVPPD: "Planning & Development",
  OP: "Office of the President",
};

export function buildSectorWorkloadData(requests: RequestRow[]) {
  const sectorMap: Record<
    string,
    { total: number; active: number; completed: number; revenue: number }
  > = {
    OVPAA: { total: 0, active: 0, completed: 0, revenue: 0 },
    OVPAF: { total: 0, active: 0, completed: 0, revenue: 0 },
    OVPRE: { total: 0, active: 0, completed: 0, revenue: 0 },
    OVPPD: { total: 0, active: 0, completed: 0, revenue: 0 },
  };

  for (const req of requests) {
    const rawSector = (req.sector || "").toUpperCase();
    let targetSector = "OVPAA";
    if (
      rawSector.includes("AF") ||
      rawSector.includes("FINANCE") ||
      rawSector.includes("ADMIN")
    ) {
      targetSector = "OVPAF";
    } else if (rawSector.includes("RE") || rawSector.includes("RESEARCH")) {
      targetSector = "OVPRE";
    } else if (rawSector.includes("PD") || rawSector.includes("PLANNING")) {
      targetSector = "OVPPD";
    } else if (rawSector in sectorMap) {
      targetSector = rawSector;
    }

    const group = sectorMap[targetSector];
    group.total += 1;
    if (req.status === "claimed") {
      group.completed += 1;
    } else if (
      req.status !== "cancelled" &&
      (req.status as string) !== "rejected"
    ) {
      group.active += 1;
    }

    const fee = Number(req.amountDue) || 0;
    if (
      fee > 0 &&
      req.status !== "cancelled" &&
      (req.status as string) !== "rejected"
    ) {
      group.revenue += fee;
    }
  }

  return Object.entries(sectorMap).map(([sector, counts]) => ({
    sector,
    label: SECTOR_LABELS[sector] || sector,
    totalRequests: counts.total,
    activeRequests: counts.active,
    completedRequests: counts.completed,
    revenue: counts.revenue,
  }));
}