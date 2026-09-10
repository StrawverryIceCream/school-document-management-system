import type { User } from "@/types";
import { createContext } from "react";

interface UsersContextType {
  users: User[];
  setUsers: (users: User[]) => void;
  loading: boolean;
  refreshAccounts: () => Promise<void>;
}

export const UsersContext = createContext<UsersContextType | null>(null)