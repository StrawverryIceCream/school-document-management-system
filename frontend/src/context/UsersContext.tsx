import type { User, UserRole } from "@/types";
import { createContext } from "react";

interface UsersContextType {
  users: User[];
  setRole: (role : UserRole | "") => void;
  search: string;
  setSearch: (query : string) => void;
  loading: boolean;
  error : string | null;
  refreshAccounts: () => Promise<void>;
}

export const UsersContext = createContext<UsersContextType | null>(null)