import type { StatusFilter } from "@/context/AdministrationViewContext";

export const BACK_LABEL = "Back";
export const SEARCH_PLACEHOLDER = "Search requester or document";
export const LOADING_LABEL = "Loading requests...";
export const EMPTY_LABEL = "No requests found.";
export const UNKNOWN_REQUESTER = "Unknown requester";
export const UNKNOWN_DOCUMENT = "Unknown document";
export const UNKNOWN_ROLE = "—";

export const TABLE_COLUMNS = [
  "Requester",
  "Role",
  "Document Type",
  "Date",
  "Status",
] as const;

export const STATUS_FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "claimed", label: "Claimed" },
  { value: "cancelled", label: "Cancelled" },
];