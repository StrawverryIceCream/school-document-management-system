import { createContext } from "react";
import type { DocumentRequest } from "@/types";
import type { WindowTile } from "@/pages/Windows";
import type { UpdateRequestStatusPayload } from "@/api/requests";
import type { DocumentRequestWithRelations, RequestStatus } from "@/types";

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
  activeView: string | null;
  selectView: (id: string) => void;
  clearView: () => void;
  visibleRequests: DocumentRequestWithRelations[];
  loading: boolean;
  error: string | null;
  filter: StatusFilter;
  setFilter: (filter: StatusFilter) => void;
  search: string;
  setSearch: (search: string) => void;
  updateRequestStatus: (
    id: string,
    status: RequestStatus,
    extra?: Omit<UpdateRequestStatusPayload, "status">,
  ) => Promise<void>;
}

export const WindowViewContext = createContext<WindowViewContextType | null>(
  null,
);