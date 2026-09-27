import { createContext } from "react";
import type { DailyCounts, TimeRange } from "@/lib/utils";

export interface DashboardStats {
  pending_payment: number;
  processing: number;
  ready: number;
  claimed: number;
  submitted?: number;
  overdue?: number;
}

export interface RequestRow {
  id: string;
  applicant: string;
  document: string;
  college?: string | null;
  window?: string | null;
  submittedAt?: string | null;
  status: "pending" | "processing" | "ready" | "claimed" | "cancelled" | "rejected";
  purpose?: string | null;
  createdAt?: string | null;
}

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