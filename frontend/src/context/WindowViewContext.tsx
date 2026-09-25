import { createContext } from "react";
import type { DocumentRequest } from "@/types";
import type { WindowTile } from "@/pages/Windows";

export type StatusFilter = "all" | DocumentRequest["status"];

export interface RequestUser {
  fullName: string;
  role: string;
}

export interface RequestDocumentType {
  name: string;
}

interface WindowViewContextType {
  activeView: string | null;
  selectView: (id: string) => void;
  clearView: () => void;
  visibleRequests: DocumentRequest[];
  usersById: Map<number, RequestUser>;
  documentTypesById: Map<number, RequestDocumentType>;
  loading: boolean;
  error: string | null;
  filter: StatusFilter;
  setFilter: (filter: StatusFilter) => void;
  search: string;
  setSearch: (search: string) => void;
  updateRequestStatus: (id: number, status: DocumentRequest["status"]) => void;
  TILES: WindowTile[]
}

export const WindowViewContext = createContext<WindowViewContextType | null>(
  null,
);