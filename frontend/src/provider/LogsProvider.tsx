import { useCallback, useEffect, useState } from "react";
import { getLogs, getLogStats } from "@/api/logs";
import { LogsContext } from "@/context/LogsContext";
import type { LogEntry, LogStats, LogType } from "@/context/LogsContext";

const SEARCH_DEBOUNCE_MS = 250;
const LOGS_PAGE_SIZE = 100;

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<LogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [typeFilter, setTypeFilter] = useState<"all" | LogType>("all");

  const loadLogs = useCallback(async () => {
    const [logsData, statsData] = await Promise.all([
      getLogs({
        search: debouncedSearch,
        type: typeFilter,
        limit: LOGS_PAGE_SIZE,
      }),
      getLogStats(),
    ]);
    return { logsData, statsData };
  }, [debouncedSearch, typeFilter]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let isCurrent = true;

    void Promise.resolve()
      .then(() => {
        if (isCurrent) setLoading(true);
        return loadLogs();
      })
      .then(({ logsData, statsData }) => {
        if (!isCurrent) return;
        setLogs(logsData);
        setStats(statsData);
        setError(null);
      })
      .catch((err: unknown) => {
        if (!isCurrent) return;
        console.error("Failed to load logs:", err);
        setError(err instanceof Error ? err.message : "Failed to load logs");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [loadLogs]);

  async function refreshLogs() {
    setLoading(true);
    try {
      const { logsData, statsData } = await loadLogs();
      setLogs(logsData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      console.error("Failed to refresh logs:", err);
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LogsContext.Provider
      value={{
        logs,
        stats,
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
