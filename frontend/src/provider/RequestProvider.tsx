import { getAllRequests } from "@/api/requests";
import { RequestContext, type StatusFilter } from "@/context/RequestContext";
import type { RequestRow } from "@/types";
import { normalizeRequestRow } from "@/utils/requests";
import { useCallback, useEffect, useMemo, useState } from "react";

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [windowFilter, setWindowFilter] = useState("all");
  const [dataSourceNote, setDataSourceNote] = useState(
    "Loading request records from the backend...",
  );

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllRequests();
      const rows = response.data
        .map((item) => normalizeRequestRow(item))
        .filter((item): item is RequestRow => Boolean(item));

      setRequests(rows);
      setTotal(response.pagination.total);
      setError(null);
      setDataSourceNote(
        rows.length === 0
          ? "No request records are available from the current backend data source yet."
          : "Live request data is active. Window filters are derived from the available request fields.",
      );
    } catch (requestError) {
      console.error("Failed to load request rows:", requestError);
      setRequests([]);
      setTotal(0);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load requests",
      );
      setDataSourceNote(
        "The request data source is not available yet. Check that the backend request routes are running.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve().then(refreshRequests);
  }, [refreshRequests]);

  const windowOptions = useMemo(
    () =>
      Array.from(
        new Set(
          requests
            .map((request) => request.window)
            .filter((value): value is string => Boolean(value && value.trim())),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [requests],
  );

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [request.applicant, request.document, request.id, request.window ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesWindow =
        windowFilter === "all" || request.window === windowFilter;

      return matchesSearch && matchesStatus && matchesWindow;
    });
  }, [requests, search, statusFilter, windowFilter]);

  const summary = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === "pending")
        .length,
      processing: requests.filter((request) => request.status === "processing")
        .length,
      ready: requests.filter((request) => request.status === "ready").length,
    }),
    [requests],
  );

  return (
    <RequestContext.Provider
      value={{
        requests,
        filteredRows,
        total,
        loading,
        error,
        dataSourceNote,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        windowFilter,
        setWindowFilter,
        windowOptions,
        summary,
        refreshRequests,
      }}
    >
      {children}
    </RequestContext.Provider>
  );
}