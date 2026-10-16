import { createContext } from "react";
import type { DocumentRequest } from "@/types";
import type { WindowTile } from "@/pages/Windows";
import type { UpdateRequestStatusPayload } from "@/api/requests";
import type { DocumentRequestWithRelations, RequestStatus } from "@/types";
import type { RequestWindow } from "@/lib/window-requests";
import type { Dispatch, SetStateAction } from "react";

export type StatusFilter = "all" | DocumentRequest["status"];

export interface RequestUser {
  fullName: string;
  role: string;
}

export interface RequestDocumentType {
  name: string;
}

interface WindowViewContextType {
  TILES: WindowTile[];
  requests: DocumentRequestWithRelations[];
  activeView: string | null;
  selectView: (id: string) => void;
  clearView: () => void;
  departmentRequests: DocumentRequestWithRelations[];
  requestWindowsById: Record<string, RequestWindow>;
  visibleRequests: DocumentRequestWithRelations[];
  loading: boolean;
  error: string | null;
  refreshRequests: () => Promise<void>;
  filter: StatusFilter;
  setFilter: (filter: StatusFilter) => void;
  search: string;
  setSearch: (search: string) => void;
  documentFilter: string;
  setDocumentFilter: Dispatch<SetStateAction<string>>;
  windowFilter: RequestWindow;
  setWindowFilter: Dispatch<SetStateAction<RequestWindow>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  selectedIds: string[];
  setSelectedIds: Dispatch<SetStateAction<string[]>>;
  selectedRequestId: string | null;
  setSelectedRequestId: Dispatch<SetStateAction<string | null>>;
  guidelinesOpen: boolean;
  setGuidelinesOpen: Dispatch<SetStateAction<boolean>>;
  updateRequestStatus: (
    id: string,
    status: RequestStatus,
    extra?: Omit<UpdateRequestStatusPayload, "status">,
  ) => Promise<void>;
}

export const WindowViewContext = createContext<WindowViewContextType | null>(
  null,
);