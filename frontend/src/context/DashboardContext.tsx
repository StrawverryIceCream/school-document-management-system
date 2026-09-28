import { createContext } from "react";
import type { RequestStatus } from "@/types";

export interface DashboardStats {
  pending: number;
  processing: number;
  ready: number;
  claimed: number;
  rejected: number;
}

export interface RequestRow {
  id: string;
  applicant: string;
  document: string;
  status: RequestStatus;
  submittedAt: string | null;
  releaseDate: string | null;
  claimedAt: string | null;
  purpose: string | null;

  college?: string | null;
  course?: string | null;
  section?: string | null;
  paymentMethod?: "cash" | "online";
  feeRequired?: boolean;
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
  timeRange: string;
  setTimeRange: (value: string) => void;
  refreshDashboard: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);
