import type { RequestRow } from "@/types";
import { createContext } from "react";

export type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "ready"
  | "claimed"
  | "cancelled";

export interface RequestContextType {
  requests: RequestRow[];
  filteredRows: RequestRow[];
  total: number;
  loading: boolean;
  error: string | null;
  dataSourceNote: string;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  windowFilter: string;
  setWindowFilter: (value: string) => void;
  windowOptions: string[];
  summary: {
    total: number;
    pending: number;
    processing: number;
    ready: number;
  };
  refreshRequests: () => Promise<void>;
}

export const RequestContext = createContext<RequestContextType | null>(null);
