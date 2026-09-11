import { getAllUsers } from "@/api/user";
import { UsersContext } from "@/context/UsersContext";
import type { User, UserRole } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [error, setError] = useState<string | null>(null);
  const [debounceSearch, setDebounceSearch] = useState(search);

  const loadUsers = useCallback(async (): Promise<User[]> => {
    const response = await getAllUsers({ role, search: debounceSearch });
    return response.data;
  }, [role, debounceSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadUsers()
      .then(setUsers)
      .catch((error) => {
        console.error("Failed to load users:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load users",
        );
      })
      .finally(() => setLoading(false));
  }, [loadUsers]);

  async function refreshAccounts() {
    setLoading(true);
    try {
      const data = await loadUsers();
      setUsers(data);
      setError(null);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }
  return (
    <UsersContext.Provider
      value={{ users, setRole, search, setSearch, loading, error, refreshAccounts }}
    >
      {children}
    </UsersContext.Provider>
  );
}
