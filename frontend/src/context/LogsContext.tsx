import { createContext } from "react";

export interface ActivityLog {
  id: string;
  userId: string;
  type: "request" | "payment" | "account" | "document";
  message: string;
  createdAt: string;
}

export interface LogEntry extends ActivityLog {
  accountName: string;
  accountRole: string;
}

export interface LogsContextType {
  logs: LogEntry[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;
  typeFilter: "all" | ActivityLog["type"];
  setTypeFilter: (value: "all" | ActivityLog["type"]) => void;
  refreshLogs: () => Promise<void>;
}

export const LogsContext = createContext<LogsContextType | undefined>(undefined);