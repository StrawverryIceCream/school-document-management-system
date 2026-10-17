import type { PaginatedUsersResponse } from "@/api/users";
import type { User, UserRole } from "@/types";
import { createContext } from "react";

// One count per role plus the grand total, so tab and card numbers stay correct while a filter is on
export type RoleCounts = Record<UserRole | "total", number>;

export type UsersPagination = PaginatedUsersResponse["pagination"];

interface UsersContextType {
  users: User[];
  role: UserRole | "";
  setRole: (role: UserRole | "") => void;
  search: string;
  setSearch: (query: string) => void;
  page: number;
  setPage: (page: number) => void;
  pagination: UsersPagination;
  counts: RoleCounts;
  loading: boolean;
  error: string | null;
  refreshAccounts: () => Promise<void>;
  exportAccounts: () => Promise<void>;
}

export const UsersContext = createContext<UsersContextType | null>(null);
