import { getAllRequests } from "@/api/requests";
import {
  RequestContext,
  type StatusFilter,
} from "@/context/RequestContext";
import type { RequestRow } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [windowFilter, setWindowFilter] = useState("all");
  const [dataSourceNote, setDataSourceNote] = useState(
    "No request records are available yet. The backend request API has not been exposed in the current project state.",
  );

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getAllRequests();
      setRequests(rows);
      setError(null);
      setDataSourceNote(
        rows.length > 0
          ? "Live request data is active. College and window filters are derived from the available request fields."
          : "No request records are available from the current data source. Once the request endpoint exposes requests, this table will populate automatically.",
      );
    } catch (requestError) {
      console.error("Failed to load request rows:", requestError);
      setRequests([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load requests",
      );
      setDataSourceNote(
        "The request data source is not available in this project yet. This page is ready to consume real request records as soon as the backend exposes them.",
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
        [
          request.applicant,
          request.document,
          request.id,
          request.window ?? "",
          request.college ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;
      const matchesCollege =
        collegeFilter === "all" || request.college === collegeFilter;
      const matchesWindow =
        windowFilter === "all" || request.window === windowFilter;

      return matchesSearch && matchesStatus && matchesCollege && matchesWindow;
    });
  }, [collegeFilter, requests, search, statusFilter, windowFilter]);

  const summary = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === "pending").length,
      processing: requests.filter((request) => request.status === "processing").length,
      ready: requests.filter((request) => request.status === "ready").length,
    }),
    [requests],
  );

  return (
    <RequestContext.Provider
      value={{
        requests,
        filteredRows,
        loading,
        error,
        dataSourceNote,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        collegeFilter,
        setCollegeFilter,
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
