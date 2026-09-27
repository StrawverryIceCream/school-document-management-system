import { createContext } from "react";
import type { DocumentRequest, RequestStatus } from "@/types";

interface MyRequestContextType {
  requests: DocumentRequest[];
  filteredRequests: DocumentRequest[];
  search: string;
  setSearch: (value: string) => void;
  statusFilter: "all" | RequestStatus;
  setStatusFilter: (status: "all" | RequestStatus) => void;
  totalCount: number;
  activeCount: number;
  readyCount: number;
}

export const MyRequestContext = createContext<MyRequestContextType | null>(null);