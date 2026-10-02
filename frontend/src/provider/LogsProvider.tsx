import { useCallback, useEffect, useState } from "react";
import { LogsContext } from "@/context/LogsContext";
import type { ActivityLog } from "@/context/LogsContext";
import type { User } from "@/types";

// 🧪 TEMPORARY MOCK DATA — the backend for accounts/logs is still in progress.
// Everything below this comment is the only thing that needs to change once
// the real endpoints exist; swap the three functions at the bottom
// (fetchMockAccounts, fetchMockLogsFor) for real calls to api/logs.ts, and
// delete the arrays. Nothing in the hook, components, or page needs to change.

const MOCK_ACCOUNTS: User[] = [
  {
    id: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f",
    studentId: "TUPM-24-1667",
    fullName: "Kat rice",
    email: "katricegarnado65@gmail.com",
    role: "admin",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
  },
  {
    id: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a",
    studentId: "TUPM-24-1725",
    fullName: "Cyrene Nathalie B. Fedoc",
    email: "cyreneadmin@example.com",
    role: "admin",
    createdAt: new Date("2024-06-02"),
    updatedAt: new Date("2024-06-02"),
  },
  {
    id: "1d938a73-9412-4c3c-9e5f-3c4d5e6f7a8b",
    studentId: "TUP-M-1638",
    fullName: "Francheska Ortiz",
    email: "cheskaadmin@example.com",
    role: "admin",
    createdAt: new Date("2024-06-03"),
    updatedAt: new Date("2024-06-03"),
  },
  {
    id: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c",
    studentId: "TUPM-24-1797",
    fullName: "Mary Ruth Cathryn Suello",
    email: "ruthadmin@example.com",
    role: "admin",
    createdAt: new Date("2024-06-04"),
    updatedAt: new Date("2024-06-04"),
  },
  {
    id: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d",
    studentId: "TUP-M-",
    fullName: "Alyson Benerao",
    email: "student@example.com",
    role: "student",
    createdAt: new Date("2024-06-05"),
    updatedAt: new Date("2024-06-05"),
  },
  {
    id: "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e",
    studentId: "TUP-M-6969",
    fullName: "Rene Butterbonia",
    email: "rene@example.com",
    role: "teacher",
    createdAt: new Date("2024-06-06"),
    updatedAt: new Date("2024-06-06"),
  },
  {
    id: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f",
    studentId: "TUP-M-1761",
    fullName: "Murielle Desamparo",
    email: "muriellelorzano@example.com",
    role: "staff",
    createdAt: new Date("2024-06-07"),
    updatedAt: new Date("2024-06-07"),
  },
  {
    id: "2b1dec5c-7567-4182-8e0e-8b9c0d1e2f3a",
    studentId: "TUP-M-1577",
    fullName: "Alyson Benerao",
    email: "test@example.com",
    role: "admin",
    createdAt: new Date("2024-06-08"),
    updatedAt: new Date("2024-06-08"),
  },
] as User[];

const MOCK_LOGS_BY_ACCOUNT: Record<string, ActivityLog[]> = {
  "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f": [
    {
      id: "log-001",
      type: "account",
      message: "Logged in to the admin portal",
      createdAt: "2026-09-28T08:12:00.000Z",
    },
    {
      id: "log-002",
      type: "request",
      message: "Reviewed request TUPM-25-0001 (Transcript of Records)",
      createdAt: "2026-09-28T08:20:00.000Z",
    },
    {
      id: "log-003",
      type: "payment",
      message: "Verified payment for request TUPM-25-0004",
      createdAt: "2026-09-29T10:05:00.000Z",
    },
  ],
  "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d": [
    {
      id: "log-004",
      type: "request",
      message: "Submitted a request for Certificate of Enrollment",
      createdAt: "2026-09-25T09:00:00.000Z",
    },
    {
      id: "log-005",
      type: "payment",
      message: "Uploaded proof of payment",
      createdAt: "2026-09-25T09:15:00.000Z",
    },
    {
      id: "log-006",
      type: "document",
      message: "Document marked as claimed",
      createdAt: "2026-09-27T14:30:00.000Z",
    },
  ],
  "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e": [
    {
      id: "log-007",
      type: "account",
      message: "Password reset requested",
      createdAt: "2026-09-20T11:00:00.000Z",
    },
  ],
};

// Simulates real network latency so loading states are actually visible
// while working against mock data.
function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function fetchMockAccounts(search: string): Promise<User[]> {
  const q = search.trim().toLowerCase();
  const filtered = q
    ? MOCK_ACCOUNTS.filter(
        (a) =>
          a.fullName.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          (a.studentId ?? "").toLowerCase().includes(q),
      )
    : MOCK_ACCOUNTS;

  return delay(filtered);
}

async function fetchMockLogsFor(userId: string): Promise<ActivityLog[]> {
  return delay(MOCK_LOGS_BY_ACCOUNT[userId] ?? []);
}



const SEARCH_DEBOUNCE_MS = 250;

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const [selectedAccount, setSelectedAccount] = useState<User | null>(null);
  const [accountLogs, setAccountLogs] = useState<ActivityLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    return fetchMockAccounts(debouncedSearch); // 👈 swap for getAllAccounts({ search }) later
  }, [debouncedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    loadAccounts()
      .then((data) => {
        setAccounts(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load accounts:", err);
        setError(err instanceof Error ? err.message : "Failed to load accounts");
      })
      .finally(() => setLoading(false));
  }, [loadAccounts]);

  async function refreshAccounts() {
    setLoading(true);
    try {
      const data = await loadAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLogsFor(account: User) {
    setLogsLoading(true);
    setLogsError(null);
    try {
      const logs = await fetchMockLogsFor(account.id); // 👈 swap for getLogsForAccount(account.id) later
      setAccountLogs(logs);
    } catch (err) {
      console.error("Failed to load logs for account:", err);
      setLogsError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLogsLoading(false);
    }
  }

  function openAccountLogs(account: User) {
    setSelectedAccount(account);
    void fetchLogsFor(account);
  }

  function closeAccountLogs() {
    setSelectedAccount(null);
    setAccountLogs([]);
    setLogsError(null);
  }

  async function refreshAccountLogs() {
    if (!selectedAccount) return;
    await fetchLogsFor(selectedAccount);
  }

  return (
    <LogsContext.Provider
      value={{
        accounts,
        loading,
        error,
        search,
        setSearch,
        selectedAccount,
        accountLogs,
        logsLoading,
        logsError,
        openAccountLogs,
        closeAccountLogs,
        refreshAccounts,
        refreshAccountLogs,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
}