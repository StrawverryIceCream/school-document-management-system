import { createContext } from "react";

export type LogType = "request" | "payment" | "account" | "document";

export interface ActivityLog {
  id: string;
  userId: string;
  type: string;
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
  logs: LogEntry[];
  stats: LogStats | null; // 
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  typeFilter: "all" | LogType;
  setTypeFilter: (value: "all" | LogType) => void;
  refreshLogs: () => Promise<void>;
}

export const LogsContext = createContext<LogsContextType | undefined>(undefined);