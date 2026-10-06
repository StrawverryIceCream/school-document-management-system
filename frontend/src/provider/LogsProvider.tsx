import { useCallback, useEffect, useState } from "react";
import { LogsContext } from "@/context/LogsContext";
import type { ActivityLog, LogEntry } from "@/context/LogsContext";
import type { User } from "@/types";

// TEMPORARY MOCK DATA 
const MOCK_ACCOUNTS: User[] = [
  { id: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", studentId: "TUPM-24-1667", fullName: "Kat rice", email: "katricegarnado65@gmail.com", role: "admin", createdAt: new Date("2024-06-01"), updatedAt: new Date("2024-06-01") },
  { id: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a", studentId: "TUPM-24-1725", fullName: "Cyrene Nathalie B. Fedoc", email: "cyreneadmin@example.com", role: "admin", createdAt: new Date("2024-06-02"), updatedAt: new Date("2024-06-02") },
  { id: "1d938a73-9412-4c3c-9e5f-3c4d5e6f7a8b", studentId: "TUP-M-1638", fullName: "Francheska Ortiz", email: "cheskaadmin@example.com", role: "admin", createdAt: new Date("2024-06-03"), updatedAt: new Date("2024-06-03") },
  { id: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c", studentId: "TUPM-24-1797", fullName: "Mary Ruth Cathryn Suello", email: "ruthadmin@example.com", role: "admin", createdAt: new Date("2024-06-04"), updatedAt: new Date("2024-06-04") },
  { id: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d", studentId: "TUP-M-", fullName: "Alyson Benerao", email: "student@example.com", role: "student", createdAt: new Date("2024-06-05"), updatedAt: new Date("2024-06-05") },
  { id: "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e", studentId: "TUP-M-6969", fullName: "Rene Butterbonia", email: "rene@example.com", role: "teacher", createdAt: new Date("2024-06-06"), updatedAt: new Date("2024-06-06") },
  { id: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", studentId: "TUP-M-1761", fullName: "Murielle Desamparo", email: "muriellelorzano@example.com", role: "staff", createdAt: new Date("2024-06-07"), updatedAt: new Date("2024-06-07") },
  { id: "2b1dec5c-7567-4182-8e0e-8b9c0d1e2f3a", studentId: "TUP-M-1577", fullName: "Alyson Benerao", email: "test@example.com", role: "admin", createdAt: new Date("2024-06-08"), updatedAt: new Date("2024-06-08") },
] as User[];

const MOCK_LOGS: ActivityLog[] = [
  { id: "log-001", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "account", message: "Logged in to the admin portal", createdAt: "2026-09-28T08:12:00.000Z" },
  { id: "log-002", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "request", message: "Reviewed request TUPM-25-0001 (Transcript of Records)", createdAt: "2026-09-28T08:20:00.000Z" },
  { id: "log-003", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "payment", message: "Verified payment for request TUPM-25-0004", createdAt: "2026-09-29T10:05:00.000Z" },
  { id: "log-004", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "document", message: "Marked request TUPM-25-0004 as ready for claim", createdAt: "2026-09-29T10:08:00.000Z" },
  { id: "log-005", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "account", message: "Updated profile contact number", createdAt: "2026-09-30T09:00:00.000Z" },
  { id: "log-006", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "request", message: "Rejected request TUPM-25-0017 (missing requirements)", createdAt: "2026-09-30T11:45:00.000Z" },
  { id: "log-007", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "account", message: "Logged out", createdAt: "2026-09-30T17:30:00.000Z" },
  { id: "log-008", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "account", message: "Logged in to the admin portal", createdAt: "2026-10-01T08:05:00.000Z" },
  { id: "log-009", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "payment", message: "Verified payment for request TUPM-25-0012", createdAt: "2026-10-01T09:40:00.000Z" },
  { id: "log-010", userId: "ad79593a-ab12-4e1a-9c3d-1a2b3c4d5e6f", type: "document", message: "Marked request TUPM-25-0012 as claimed", createdAt: "2026-10-02T13:15:00.000Z" },

  { id: "log-011", userId: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a", type: "account", message: "Logged in to the admin portal", createdAt: "2026-09-27T07:50:00.000Z" },
  { id: "log-012", userId: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a", type: "request", message: "Reviewed request TUPM-25-0005 (Good Moral Certificate)", createdAt: "2026-09-27T08:10:00.000Z" },
  { id: "log-013", userId: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a", type: "document", message: "Marked request TUPM-25-0005 as ready for claim", createdAt: "2026-09-27T08:12:00.000Z" },
  { id: "log-014", userId: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a", type: "account", message: "Changed account password", createdAt: "2026-09-28T16:00:00.000Z" },
  { id: "log-015", userId: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a", type: "request", message: "Reviewed request TUPM-25-0009 (Certificate of Enrollment)", createdAt: "2026-10-01T10:30:00.000Z" },
  { id: "log-016", userId: "fa249c62-2531-4b2b-8d4e-2b3c4d5e6f7a", type: "payment", message: "Verified payment for request TUPM-25-0009", createdAt: "2026-10-01T10:32:00.000Z" },

  { id: "log-017", userId: "1d938a73-9412-4c3c-9e5f-3c4d5e6f7a8b", type: "account", message: "Logged in to the admin portal", createdAt: "2026-09-25T09:15:00.000Z" },
  { id: "log-018", userId: "1d938a73-9412-4c3c-9e5f-3c4d5e6f7a8b", type: "request", message: "Reviewed request TUPM-25-0002 (Diploma)", createdAt: "2026-09-25T09:30:00.000Z" },
  { id: "log-019", userId: "1d938a73-9412-4c3c-9e5f-3c4d5e6f7a8b", type: "document", message: "Marked request TUPM-25-0002 as claimed", createdAt: "2026-09-26T14:00:00.000Z" },
  { id: "log-020", userId: "1d938a73-9412-4c3c-9e5f-3c4d5e6f7a8b", type: "account", message: "Logged out", createdAt: "2026-09-26T17:00:00.000Z" },

  { id: "log-021", userId: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c", type: "account", message: "Logged in to the admin portal", createdAt: "2026-09-29T08:00:00.000Z" },
  { id: "log-022", userId: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c", type: "request", message: "Reviewed request TUPM-25-0014 (Transcript of Records)", createdAt: "2026-09-29T08:25:00.000Z" },
  { id: "log-023", userId: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c", type: "payment", message: "Verified payment for request TUPM-25-0014", createdAt: "2026-09-29T08:40:00.000Z" },
  { id: "log-024", userId: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c", type: "document", message: "Marked request TUPM-25-0014 as ready for claim", createdAt: "2026-09-29T08:42:00.000Z" },
  { id: "log-025", userId: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c", type: "request", message: "Rejected request TUPM-25-0018 (invalid purpose)", createdAt: "2026-09-30T13:50:00.000Z" },
  { id: "log-026", userId: "bdd1e3c6-f823-4d4d-af6a-4d5e6f7a8b9c", type: "account", message: "Updated department assignment", createdAt: "2026-10-02T09:10:00.000Z" },

  { id: "log-027", userId: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d", type: "request", message: "Submitted a request for Certificate of Enrollment", createdAt: "2026-09-25T09:00:00.000Z" },
  { id: "log-028", userId: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d", type: "payment", message: "Uploaded proof of payment", createdAt: "2026-09-25T09:15:00.000Z" },
  { id: "log-029", userId: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d", type: "document", message: "Document marked as claimed", createdAt: "2026-09-27T14:30:00.000Z" },
  { id: "log-030", userId: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d", type: "account", message: "Updated profile photo", createdAt: "2026-09-28T19:00:00.000Z" },
  { id: "log-031", userId: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d", type: "request", message: "Submitted a request for Transcript of Records", createdAt: "2026-10-01T10:00:00.000Z" },
  { id: "log-032", userId: "f9ac1201-eb34-4e5e-bb7b-5e6f7a8b9c0d", type: "payment", message: "Uploaded proof of payment", createdAt: "2026-10-01T10:05:00.000Z" },

  { id: "log-033", userId: "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e", type: "account", message: "Password reset requested", createdAt: "2026-09-20T11:00:00.000Z" },
  { id: "log-034", userId: "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e", type: "account", message: "Password reset completed", createdAt: "2026-09-20T11:10:00.000Z" },
  { id: "log-035", userId: "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e", type: "request", message: "Submitted a request for Certificate of Employment", createdAt: "2026-09-26T13:20:00.000Z" },
  { id: "log-036", userId: "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e", type: "document", message: "Document marked as ready for claim", createdAt: "2026-09-29T15:00:00.000Z" },
  { id: "log-037", userId: "0e8984e2-9c45-4f6f-ac8c-6f7a8b9c0d1e", type: "document", message: "Document marked as claimed", createdAt: "2026-10-01T08:30:00.000Z" },

  { id: "log-038", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "account", message: "Logged in to the staff portal", createdAt: "2026-09-26T07:45:00.000Z" },
  { id: "log-039", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "request", message: "Processed request TUPM-25-0007 at Window 2", createdAt: "2026-09-26T08:00:00.000Z" },
  { id: "log-040", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "payment", message: "Collected cash payment for request TUPM-25-0007", createdAt: "2026-09-26T08:05:00.000Z" },
  { id: "log-041", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "document", message: "Released document for request TUPM-25-0007", createdAt: "2026-09-26T08:10:00.000Z" },
  { id: "log-042", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "request", message: "Processed request TUPM-25-0011 at Window 2", createdAt: "2026-09-29T09:30:00.000Z" },
  { id: "log-043", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "account", message: "Logged out", createdAt: "2026-09-29T17:00:00.000Z" },
  { id: "log-044", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "account", message: "Logged in to the staff portal", createdAt: "2026-10-02T07:50:00.000Z" },
  { id: "log-045", userId: "d56467d8-9256-4071-ad9d-7a8b9c0d1e2f", type: "payment", message: "Collected online payment for request TUPM-25-0016", createdAt: "2026-10-02T10:15:00.000Z" },

  { id: "log-046", userId: "2b1dec5c-7567-4182-8e0e-8b9c0d1e2f3a", type: "account", message: "Logged in to the admin portal", createdAt: "2026-09-24T08:00:00.000Z" },
  { id: "log-047", userId: "2b1dec5c-7567-4182-8e0e-8b9c0d1e2f3a", type: "request", message: "Reviewed request TUPM-25-0003 (Good Moral Certificate)", createdAt: "2026-09-24T08:20:00.000Z" },
  { id: "log-048", userId: "2b1dec5c-7567-4182-8e0e-8b9c0d1e2f3a", type: "document", message: "Marked request TUPM-25-0003 as ready for claim", createdAt: "2026-09-24T08:22:00.000Z" },
  { id: "log-049", userId: "2b1dec5c-7567-4182-8e0e-8b9c0d1e2f3a", type: "account", message: "Updated email notification preferences", createdAt: "2026-09-27T12:00:00.000Z" },
  { id: "log-050", userId: "2b1dec5c-7567-4182-8e0e-8b9c0d1e2f3a", type: "request", message: "Reviewed request TUPM-25-0010 (Certificate of Enrollment)", createdAt: "2026-10-02T11:00:00.000Z" },
];

function delay<T>(value: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Joins each raw log with its account's name/role, then applies search and
// type filtering, newest first — this is what a real backend's
// GET /api/logs?search=&type= would already return pre-joined.
async function fetchMockLogs(
  search: string,
  typeFilter: "all" | ActivityLog["type"],
): Promise<LogEntry[]> {
  const accountById = new Map(MOCK_ACCOUNTS.map((a) => [a.id, a]));

  let joined: LogEntry[] = MOCK_LOGS.map((log) => {
    const account = accountById.get(log.userId);
    return {
      ...log,
      accountName: account?.fullName ?? "Unknown account",
      accountRole: account?.role ?? "unknown",
    };
  });

  if (typeFilter !== "all") {
    joined = joined.filter((log) => log.type === typeFilter);
  }

  const q = search.trim().toLowerCase();
  if (q) {
    joined = joined.filter(
      (log) =>
        log.accountName.toLowerCase().includes(q) ||
        log.message.toLowerCase().includes(q),
    );
  }

  joined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return delay(joined);
}



const SEARCH_DEBOUNCE_MS = 250;

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [typeFilter, setTypeFilter] = useState<"all" | ActivityLog["type"]>("all");

  const loadLogs = useCallback(async () => {
    return fetchMockLogs(debouncedSearch, typeFilter); // 👈 swap for a real API call later
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    loadLogs()
      .then((data) => {
        setLogs(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load logs:", err);
        setError(err instanceof Error ? err.message : "Failed to load logs");
      })
      .finally(() => setLoading(false));
  }, [loadLogs]);

  async function refreshLogs() {
    setLoading(true);
    try {
      const data = await loadLogs();
      setLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LogsContext.Provider
      value={{
        logs,
        loading,
        error,
        search,
        setSearch,
        typeFilter,
        setTypeFilter,
        refreshLogs,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
}