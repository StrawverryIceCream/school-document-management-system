import { createContext } from "react";

export interface ActivityLog {
  id: string;
  userId: string;
  type: "request" | "payment" | "account" | "document";
  message: string;
  createdAt: string;
}

// What the table actually renders: one log entry joined with the
// account info needed to display it.
export interface LogEntry extends ActivityLog {
  accountName: string;
  accountRole: string;
  accountStudentId: string | null;
}

// Summary numbers for the cards. Not affected by search/type filters.
export interface LogStats {
  total: number;
  activeAccounts: number;
  lastActivityAt: string | null;
}

export interface LogsContextType {
  logs: LogEntry[]; // current page only
  stats: LogStats | null;
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  typeFilter: "all" | ActivityLog["type"];
  setTypeFilter: (value: "all" | ActivityLog["type"]) => void;
  refreshLogs: () => Promise<void>;
  page: number;
  setPage: (value: number) => void;
  totalPages: number;
}

export const LogsContext = createContext<LogsContextType | undefined>(undefined);

