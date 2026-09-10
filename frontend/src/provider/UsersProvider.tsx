import { getAllUsers } from "@/api/user";
import { UsersContext } from "@/context/UsersContext";
import type { User } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async (): Promise<User[]> => {
    const data = await getAllUsers();
    return data;
  }, []);

  useEffect(() => {
    loadUsers()
      .then(setUsers)
      .catch((error) => {
        console.error("Failed to load users:", error);
      })
      .finally(() => setLoading(false));
  }, [loadUsers]);

  async function refreshAccounts() {
    setLoading(true);
    try {
      const data = await loadUsers();
      setUsers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <UsersContext.Provider
      value={{ users, setUsers, loading, refreshAccounts }}
    >
      {children}
    </UsersContext.Provider>
  );
}
