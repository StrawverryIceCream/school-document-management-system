import type { RequestRow } from "@/context/DashboardContext";
import { findOfficeRoute } from "@/lib/sectors/sectors-config";

export interface OfficeCounterLoadItem {
  id: string;
  officeCode: string;
  officeName: string;
  sector?: string | null;
  count: number;
  statusText: "Idle" | "Normal" | "Active" | "Heavy";
  statusColor: string;
  barBg: string;
  routeUrl?: string;
}

const DEFAULT_OFFICES = [
  { code: "OUR", name: "University Registrar", sector: "OVPAA", barColor: "bg-primary" },
  { code: "HRMO", name: "Human Resource Mgmt", sector: "OVPAF", barColor: "bg-sky-500" },
  { code: "CASHIER", name: "Cashier's Office", sector: "OVPAF", barColor: "bg-emerald-500" },
  { code: "ACCOUNTING", name: "Accounting Office", sector: "OVPAF", barColor: "bg-amber-500" },
  { code: "AUXILIARY", name: "Auxiliary Services", sector: "OVPAF", barColor: "bg-purple-500" },
  { code: "COL", name: "Academic Colleges", sector: "OVPAA", barColor: "bg-rose-500" },
];

export function calculateOfficeCounterLoads(
  requests: RequestRow[],
  maxOffices = 6,
): OfficeCounterLoadItem[] {
  // Active requests needing processing or claim
  const activeRequests = requests.filter(
    (r) =>
      r.status === "pending" ||
      r.status === "awaiting_payment" ||
      r.status === "processing" ||
      r.status === "ready",
  );

  // Tally counts by office code
  const countMap = new Map<
    string,
    {
      code: string;
      name: string;
      sector?: string | null;
      officeId?: string | null;
      count: number;
    }
  >();

  // Initialize with default standard institutional offices
  for (const def of DEFAULT_OFFICES) {
    countMap.set(def.code.toUpperCase(), {
      code: def.code,
      name: def.name,
      sector: def.sector,
      count: 0,
    });
  }

  // Count active requests
  for (const req of activeRequests) {
    const rawCode =
      req.officeCode ||
      (req.documentTypeCode?.includes("-")
        ? req.documentTypeCode.split("-")[0]
        : "OUR");
    const code = rawCode.toUpperCase();
    const existing = countMap.get(code);

    if (existing) {
      existing.count += 1;
      if (req.officeName && existing.name.startsWith("Office (")) existing.name = req.officeName;
      if (req.sector && !existing.sector) existing.sector = req.sector;
      if (req.officeId && !existing.officeId) existing.officeId = req.officeId;
    } else {
      countMap.set(code, {
        code,
        name: req.officeName || `Office (${code})`,
        sector: req.sector,
        officeId: req.officeId,
        count: 1,
      });
    }
  }

  // Convert to array and sort by count descending
  const sorted = Array.from(countMap.values()).sort((a, b) => b.count - a.count);

  // Take top N offices
  const selected = sorted.slice(0, maxOffices);

  return selected.map((item, index) => {
    let statusText: "Idle" | "Normal" | "Active" | "Heavy" = "Idle";
    let statusColor = "text-muted-foreground";
    let barBg = "bg-muted";

    if (item.count >= 8) {
      statusText = "Heavy";
      statusColor = "text-rose-600 dark:text-rose-400 font-bold";
      barBg = "bg-rose-500";
    } else if (item.count >= 4) {
      statusText = "Active";
      statusColor = "text-emerald-600 dark:text-emerald-400 font-semibold";
      barBg = "bg-emerald-500";
    } else if (item.count >= 1) {
      statusText = "Normal";
      statusColor = "text-sky-600 dark:text-sky-400 font-medium";
      barBg = "bg-primary";
    }

    const route = findOfficeRoute({
      officeCode: item.code,
      officeId: item.officeId ?? undefined,
      officeName: item.name,
      sector: item.sector ?? undefined,
    });

    return {
      id: `office-${item.code.toLowerCase()}-${index}`,
      officeCode: item.code,
      officeName: item.name,
      sector: item.sector,
      count: item.count,
      statusText,
      statusColor,
      barBg,
      routeUrl: route?.url,
    };
  });
}
