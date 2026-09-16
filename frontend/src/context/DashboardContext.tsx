import { createContext } from "react";
import type { DashboardStats, RequestType } from "@/types";

export interface DashboardContextType {
  stats: DashboardStats | null;
  requests: RequestType[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  status: string | undefined;
  setStatus: (value: string | undefined) => void;
  refreshDashboard: () => Promise<void>;
}

export const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);