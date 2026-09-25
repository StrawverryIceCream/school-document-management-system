import { useCallback, useEffect, useMemo, useState } from "react";
import { DashboardContext } from "@/context/DashboardContext";
import { getDashboardStats } from "@/api/dashboard";
import { getAllRequests } from "@/api/requests";
import { normalizeRequestRow } from "@/lib/utils";
import {
  DEFAULT_TIME_RANGE,
  buildDailyCounts,
  filterByTimeRange,
  type TimeRange,
} from "@/lib/utils";
import type { DashboardStats, RequestRow } from "@/types";

const SEARCH_DEBOUNCE_MS = 250;
const DASHBOARD_LOAD_ERROR = "Failed to load dashboard data";
// Stable reference so the memoized chart data does not recompute on every render
const EMPTY_REQUESTS: RequestRow[] = [];

interface DashboardData {
  stats: DashboardStats;
  requests: RequestRow[];
  total: number;
}

interface DashboardResult {
  requestKey: string;
  data: DashboardData | null;
  error: string | null;
}

async function loadDashboardData(search: string): Promise<DashboardData> {
  const [stats, response] = await Promise.all([
    getDashboardStats(),
    getAllRequests({ search }),
  ]);

  // Backend rows can be malformed; drop anything that fails normalization
  const requests = response.data
    .map((item) => normalizeRequestRow(item))
    .filter((item): item is RequestRow => Boolean(item));

  return { stats, requests, total: response.pagination.total };
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [result, setResult] = useState<DashboardResult | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [timeRange, setTimeRange] = useState<TimeRange>(DEFAULT_TIME_RANGE);

  // Loading is derived: it stays true until a result exists for the current inputs
  const requestKey = `${debouncedSearch}|${refreshToken}`;
  const loading = result?.requestKey !== requestKey;

  const stats = result?.data?.stats ?? null;
  const requests = result?.data?.requests ?? EMPTY_REQUESTS;
  const total = result?.data?.total ?? 0;
  const error = loading ? null : (result?.error ?? null);

  const dailyCounts = useMemo(() => buildDailyCounts(requests), [requests]);
  const chartData = useMemo(
    () => filterByTimeRange(dailyCounts, timeRange),
    [dailyCounts, timeRange],
  );

  const refreshDashboard = useCallback(() => {
    setRefreshToken((token) => token + 1);
  }, []);

  // Avoid firing a request on every keystroke
  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      try {
        const data = await loadDashboardData(debouncedSearch);
        if (!cancelled) setResult({ requestKey, data, error: null });
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load dashboard data:", err);
        setResult({
          requestKey,
          data: null,
          error: err instanceof Error ? err.message : DASHBOARD_LOAD_ERROR,
        });
      }
    }

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, requestKey]);

  return (
    <DashboardContext.Provider
      value={{
        stats,
        requests,
        total,
        loading,
        error,
        search,
        setSearch,
        status,
        setStatus,
        timeRange,
        setTimeRange,
        chartData,
        refreshDashboard,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}