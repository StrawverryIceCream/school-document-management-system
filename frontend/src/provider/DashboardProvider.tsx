import { useCallback, useEffect, useState } from "react";
import { DashboardContext } from "@/context/DashboardContext";
import type { DashboardStats, RequestRow } from "@/context/DashboardContext";
import { getAllRequests } from "@/api/requests";
import { normalizeRequestRow } from "@/lib/request";
import { buildStatsFromRequests } from "@/lib/dashboard";
import type { RequestStatus } from "@/types";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [timeRange, setTimeRange] = useState("90d");
  const [debounceSearch, setDebounceSearch] = useState(search);

  const loadRequests = useCallback(async (): Promise<RequestRow[]> => {
    const response = await getAllRequests({
      search: debounceSearch,
      status: status as RequestStatus | undefined,
    });
    return response.data.map(normalizeRequestRow);
  }, [debounceSearch, status]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setLoading(true);

      try {
        const data = await loadRequests();
        if (!isMounted) return;
        setRequests(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load requests:", err);
        setError(err instanceof Error ? err.message : "Failed to load requests");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [loadRequests]);

  async function refreshDashboard() {
    setLoading(true);
    try {
      const data = await loadRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  }

  // No separate stats endpoint exists — derive counts from whatever
  // requests we already fetched instead.
  const stats: DashboardStats | null = error ? null : buildStatsFromRequests(requests);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        requests,
        loading,
        error,
        search,
        setSearch,
        status,
        setStatus,
        timeRange,
        setTimeRange,
        refreshDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}