import { getDashboardStats, getAllRequests } from "@/api/dashboard";
import { DashboardContext } from "@/context/DashboardContext";
import type { DashboardStats, RequestType } from "@/types";
import { useCallback, useEffect, useState } from "react";

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [timeRange, setTimeRange] = useState("90d"); // 👈 new
  const [debounceSearch, setDebounceSearch] = useState(search);

  const loadDashboardData = useCallback(async (): Promise<{
    stats: DashboardStats;
    requests: RequestType[];
  }> => {
    const [stats, requestsResponse] = await Promise.all([
      getDashboardStats(),
      getAllRequests({
        search: debounceSearch,
        status: status,
      }),
    ]);
    return { stats, requests: requestsResponse.data };
  }, [debounceSearch, status]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    loadDashboardData()
      .then(({ stats, requests }) => {
        setStats(stats);
        setRequests(requests);
      })
      .catch((error) => {
        console.error("Failed to load dashboard data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load dashboard data",
        );
      })
      .finally(() => setLoading(false));
  }, [loadDashboardData]);

  async function refreshDashboard() {
    setLoading(true);
    try {
      const { stats, requests } = await loadDashboardData();
      setStats(stats);
      setRequests(requests);
      setError(null);
    } catch (error) {
      console.log(error);
      setError(error instanceof Error ? error.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

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
        timeRange, // 👈 new
        setTimeRange, // 👈 new
        refreshDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}