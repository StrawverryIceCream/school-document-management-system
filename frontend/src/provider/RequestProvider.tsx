import { getAllRequests } from "@/api/requests";
import {
  RequestContext,
  type StatusFilter,
} from "@/context/RequestContext";
import type { DocumentRequest, RequestRow } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";

const mockRequests: DocumentRequest[] = [
  {
    id: 1001,
    userId: 21,
    documentTypeId: 1,
    purpose: "Internship application",
    formData: {
      applicant: "Maria Santos",
      document: "Certificate of Enrollment",
      window: "Window 1",
      submittedAt: "2026-09-18",
    },
    status: "pending",
    releaseDate: null,
    claimedAt: null,
    staffNotes: null,
    createdAt: new Date("2026-09-18T09:15:00Z"),
    updatedAt: new Date("2026-09-18T09:15:00Z"),
  },
  {
    id: 1002,
    userId: 22,
    documentTypeId: 2,
    purpose: "Scholarship requirement",
    formData: {
      applicant: "Daniel Cruz",
      document: "Transcript of Records",
      window: "Window 2",
      submittedAt: "2026-09-17",
    },
    status: "processing",
    releaseDate: null,
    claimedAt: null,
    staffNotes: "Under verification",
    createdAt: new Date("2026-09-17T13:40:00Z"),
    updatedAt: new Date("2026-09-18T08:00:00Z"),
  },
];

function mapMockRequest(request: DocumentRequest): RequestRow {
  const formData = request.formData;
  return {
    id: String(request.id),
    applicant: String(formData.applicant ?? "Unknown applicant"),
    document: String(formData.document ?? "Unknown document"),
    window: typeof formData.window === "string" ? formData.window : null,
    submittedAt: typeof formData.submittedAt === "string"
      ? formData.submittedAt
      : request.createdAt.toISOString().slice(0, 10),
    status: request.status,
    purpose: request.purpose,
    createdAt: request.createdAt.toISOString(),
  };
}

export function RequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [windowFilter, setWindowFilter] = useState("all");
  const [dataSourceNote, setDataSourceNote] = useState(
    "No request records are available yet. The backend request API has not been exposed in the current project state.",
  );

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getAllRequests();
      setRequests(rows.length > 0 ? rows : mockRequests.map(mapMockRequest));
      setError(null);
      setDataSourceNote(
        rows.length > 0
          ? "Live request data is active. Window filters are derived from the available request fields."
          : "Showing sample request records until the request data source returns records.",
      );
    } catch (requestError) {
      console.error("Failed to load request rows:", requestError);
      setRequests(mockRequests.map(mapMockRequest));
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load requests",
      );
      setDataSourceNote(
        "The request data source is not available yet. Showing sample request records until the backend exposes requests.",
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
        ]
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
