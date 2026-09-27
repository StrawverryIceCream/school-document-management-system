import { createContext } from "react";
import type { WindowTile, WindowViewId } from "@/pages/Windows";
import type { RequestRow, RequestStatus } from "@/types";

export type StatusFilter =
  | "all"
  | "pending"
  | "processing"
  | "ready"
  | "claimed"
  | "cancelled"
  | "rejected";

export type WindowViewRequestStatus = RequestStatus | "cancelled";

export interface WindowViewContextType {
  activeView: WindowViewId | null;
  selectView: (id: WindowViewId) => void;
  clearView: () => void;
  visibleRequests: RequestRow[];
  loading: boolean;
  error: string | null;
  filter: StatusFilter;
  setFilter: (value: StatusFilter) => void;
  search: string;
  setSearch: (value: string) => void;
  updateRequestStatus: (
    requestId: string,
    status: WindowViewRequestStatus,
  ) => void;
  TILES: WindowTile[];
}

export const WindowViewContext = createContext<WindowViewContextType | null>(null);