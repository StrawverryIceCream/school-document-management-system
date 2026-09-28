import type { AuthUser } from "@/types";
import { createContext } from "react";

interface AuthContextType {
  user: AuthUser | null;
   setUser: (user: AuthUser | null) => void;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
