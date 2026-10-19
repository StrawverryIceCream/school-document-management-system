import { createContext } from "react";
import type { AdministrationUnit } from "@/lib/administration/administration-units";
import type { DocumentRequestWithRelations, RequestStatus } from "@/types";

export type StatusFilter = "all" | RequestStatus;

interface AdministrationViewContextType {
  activeUnit: AdministrationUnit | null;
  selectUnit: (id: string) => void;
  clearUnit: () => void;
  // Every faculty/staff request, before any unit, status, or search filter
  requests: DocumentRequestWithRelations[];
  // Requests of the active unit after the status and search filters
  visibleRequests: DocumentRequestWithRelations[];
  loading: boolean;
  error: string | null;
  filter: StatusFilter;
  setFilter: (filter: StatusFilter) => void;
  search: string;
  setSearch: (search: string) => void;
}

export const AdministrationViewContext =
  createContext<AdministrationViewContextType | null>(null);