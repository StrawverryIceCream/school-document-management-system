import { createContext } from "react";
import type { DashboardStats, RequestRow } from "@/types";
import type { DailyCounts, TimeRange } from "@/lib/utils";

interface DashboardContextType {
  stats: DashboardStats | null;
  requests: RequestRow[];
  total: number;
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (search: string) => void;
  status: string | undefined;
  setStatus: (status: string | undefined) => void;
  chartData: DailyCounts[];
  timeRange: TimeRange;
  setTimeRange: (timeRange: TimeRange) => void;
  refreshDashboard: () => void;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);