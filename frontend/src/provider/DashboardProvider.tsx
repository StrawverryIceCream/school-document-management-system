import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardContext } from "@/context/DashboardContext";
import type { DashboardStats, RequestRow } from "@/context/DashboardContext";
import { getAllRequests } from "@/api/requests";
import { normalizeRequestRow } from "@/lib/requests";
import { buildStatsFromRequests } from "@/lib/dashboard";
import type { RequestStatus } from "@/types";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [sector, setSector] = useState<string | undefined>(undefined);
  const [timeRange, setTimeRange] = useState("90d");
  const [debounceSearch, setDebounceSearch] = useState(search);

  const loadRequests = useCallback(async (): Promise<RequestRow[]> => {
    const response = await getAllRequests({
      search: debounceSearch,
      status: status as RequestStatus | undefined,
      sector,
      limit: 200,
    });
    return response.data.map(normalizeRequestRow);
  }, [debounceSearch, status, sector]);

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

  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => Date.now());

  async function refreshDashboard() {
    setLoading(true);
    setLastRefreshedAt(Date.now());
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

  // Filter requests based on time range selection
  const filteredRequests = useMemo(() => {
    if (timeRange === "all") return requests;
    const daysMap: Record<string, number> = {
      "24h": 1,
      today: 1,
      "7d": 7,
      week: 7,
      "30d": 30,
      "90d": 90,
      sem: 120,
    };
    const maxDays = daysMap[timeRange] ?? 90;
    const cutoff = lastRefreshedAt - maxDays * 24 * 60 * 60 * 1000;
    return requests.filter((r) => {
      if (!r.submittedAt) return true;
      return new Date(r.submittedAt).getTime() >= cutoff;
    });
  }, [requests, timeRange, lastRefreshedAt]);

  const stats: DashboardStats | null = error
    ? null
    : buildStatsFromRequests(filteredRequests);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        requests: filteredRequests,
        loading,
        error,
        search,
        setSearch,
        status,
        setStatus,
        sector,
        setSector,
        timeRange,
        setTimeRange,
        refreshDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}