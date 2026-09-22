import type { RequestRow } from "@/types";
import { createContext } from "react";

export type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "ready"
  | "claimed"
  | "cancelled";

export const collegeOptions = [
  "College of Science (COS)",
  "College of Engineering (COE)",
  "College of Industrial Technology (CIT)",
  "College of Industrial Education (CIE)",
  "College of Architecture and Fine Arts (CAFA)",
  "College of Management and Multidisciplinary Studies (CMMS)",
] as const;

export interface RequestContextType {
  requests: RequestRow[];
  filteredRows: RequestRow[];
  loading: boolean;
  error: string | null;
  dataSourceNote: string;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (value: StatusFilter) => void;
  collegeFilter: string;
  setCollegeFilter: (value: string) => void;
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
