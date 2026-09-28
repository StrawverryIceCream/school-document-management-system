// provider/AuthProvider.tsx
import { useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
} from "@/api/auth";
import type { AuthUser } from "@/types";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    // The login response is already the full auth user, so no second /me request
    const userData = await apiLogin(email, password);
    setUser(userData);
  }

  async function logout() {
    await apiLogout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}