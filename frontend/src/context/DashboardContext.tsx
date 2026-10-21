import { createContext } from "react";
import type { RequestStatus } from "@/types";

export interface DashboardStats {
  pending: number;
  processing: number;
  ready: number;
  claimed: number;
  cancelled: number;
  // Extended Operational KPIs from DashboardPage.html
  immediateBacklog: number;
  inProduction: number;
  readyForRelease: number;
  slaWarning: number;
  totalRevenue: number;
  settledTransactions: number;
  efficiencyRate: number;
  avgTurnaroundDays: number;
}

export interface RequestRow {
  id: string;
  referenceNumber?: string;
  userId?: string;
  applicant: string;
  studentId?: string | null;
  document: string;
  status: RequestStatus;
  submittedAt: string | null;
  releaseDate: string | null;
  claimedAt: string | null;
  purpose: string | null;
  amountDue?: string;
  processingDays?: number;

  college?: string | null;
  collegeName?: string | null;
  course?: string | null;
  section?: string | null;
  windowId?: string | null;
  officeId?: string | null;
  officeCode?: string | null;
  officeName?: string | null;
  sector?: string | null;
  documentTypeCode?: string;
  paymentMethod?: "cash" | "online";
  feeRequired?: boolean;
}

export interface SectorWorkloadItem {
  sector: string;
  label: string;
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  revenue: number;
}

export interface DashboardContextType {
  stats: DashboardStats | null;
  requests: RequestRow[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  status: string | undefined;
  setStatus: (value: string | undefined) => void;
  sector: string | undefined;
  setSector: (value: string | undefined) => void;
  timeRange: string;
  setTimeRange: (value: string) => void;
  refreshDashboard: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);
