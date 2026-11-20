// provider/AuthProvider.tsx
import { useEffect, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  getCurrentUser,
  isTwoFactorChallenge,
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

  async function login(email: string, password: string, otp?: string) {
    // The login response is already the full auth user or a 2FA challenge
    const result = await apiLogin(email, password, otp ? { otp } : undefined);
    if (isTwoFactorChallenge(result)) {
      return result;
    }
    setUser(result);
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