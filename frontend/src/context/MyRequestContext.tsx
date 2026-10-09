import type { MyRequest } from "@/api/requests";
import type { RequestStatus } from "@/types";
import { createContext } from "react";

export interface MyRequestWithDocumentName extends MyRequest {
  documentName: string;
}

interface MyRequestContextType {
  requests: MyRequestWithDocumentName[];
  filteredRequests: MyRequestWithDocumentName[];
  search: string;
  setSearch: (value: string) => void;
  statusFilter: "all" | RequestStatus;
  setStatusFilter: (status: "all" | RequestStatus) => void;
  totalCount: number;
  activeCount: number;
  readyCount: number;
  loading: boolean;
  error: string | null;
  refreshMyRequests: () => Promise<void>;
}

export const MyRequestContext = createContext<MyRequestContextType | null>(
  null,
);