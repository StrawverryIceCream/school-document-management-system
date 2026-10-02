import { createContext } from "react";
import type { User } from "@/types";

export interface ActivityLog {
  id: string;
  type: "request" | "payment" | "account" | "document";
  message: string;
  createdAt: string;
}

export interface LogsContextType {
  accounts: User[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (value: string) => void;

  selectedAccount: User | null;
  accountLogs: ActivityLog[];
  logsLoading: boolean;
  logsError: string | null;
  openAccountLogs: (account: User) => void;
  closeAccountLogs: () => void;

  refreshAccounts: () => Promise<void>;
  refreshAccountLogs: () => Promise<void>;
}

export const LogsContext = createContext<LogsContextType | undefined>(undefined);