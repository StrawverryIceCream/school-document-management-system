import { useEffect, useMemo, useState } from "react";
import RequestHeader, {
  type StatusFilter,
} from "@/components/all_requests/RequestHeader";
import RequestSummary from "@/components/all_requests/RequestSummary";
import RequestTable, {
  type RequestRow,
} from "@/components/all_requests/RequestTable";

const collegeOptions = [
  "College of Science (COS)",
  "College of Engineering (COE)",
  "College of Industrial Technology (CIT)",
  "College of Industrial Education (CIE)",
  "College of Architecture and Fine Arts (CAFA)",
  "College of Management and Multidisciplinary Studies (CMMS)",
] as const;

const REQUEST_ENDPOINTS = [
  "/api/requests",
  "/api/document-requests",
  "/api/documents/requests",
  "/api/registrar/requests",
] as const;

function normalizeStatus(value: string | null | undefined): RequestRow["status"] {
  const status = value?.toLowerCase();

  switch (status) {
    case "pending":
      return "pending";
    case "processing":
    case "in-progress":
      return "processing";
    case "ready":
      return "ready";
    case "claimed":
      return "claimed";
    case "cancelled":
    case "rejected":
      return "cancelled";
    default:
      return "pending";
  }
}

function normalizeRequestRow(raw: Record<string, unknown>): RequestRow | null {
  if (!raw || typeof raw !== "object") return null;

  const user = raw.user as Record<string, unknown> | undefined;
  const documentType = raw.documentType as Record<string, unknown> | undefined;
  const document = raw.document as Record<string, unknown> | undefined;
  const documentTypeAlt = raw.document_type as Record<string, unknown> | undefined;
  const windowData = raw.window as Record<string, unknown> | undefined;

  const id = String(
    raw.id ?? raw.requestId ?? raw.request_id ?? raw.requestNumber ?? "unknown",
  );

  const applicant =
    String(
      (user && typeof user.fullName === "string" && user.fullName) ||
        (user && typeof user.full_name === "string" && user.full_name) ||
        (typeof raw.applicantName === "string" && raw.applicantName) ||
        (typeof raw.studentName === "string" && raw.studentName) ||
        (user && typeof user.email === "string" && user.email) ||
        "Unknown applicant",
    ) || "Unknown applicant";

  const documentName =
    String(
      (documentType && typeof documentType.name === "string" && documentType.name) ||
        (document && typeof document.name === "string" && document.name) ||
        (typeof raw.documentName === "string" && raw.documentName) ||
        (documentTypeAlt && typeof documentTypeAlt.name === "string" && documentTypeAlt.name) ||
        "Unknown document",
    ) || "Unknown document";

  const college =
    typeof raw.college === "string"
      ? raw.college
      : typeof raw.collegeName === "string"
        ? raw.collegeName
        : user && typeof user.college === "string"
          ? user.college
          : user && typeof user.collegeName === "string"
            ? user.collegeName
            : null;

  const window =
    typeof raw.window === "string"
      ? raw.window
      : typeof raw.windowName === "string"
        ? raw.windowName
        : windowData && typeof windowData.name === "string"
          ? windowData.name
          : null;

  const submittedAt =
    typeof raw.createdAt === "string"
      ? raw.createdAt
      : typeof raw.submittedAt === "string"
        ? raw.submittedAt
        : typeof raw.requestedAt === "string"
          ? raw.requestedAt
          : null;

  const purpose =
    typeof raw.purpose === "string"
      ? raw.purpose
      : typeof raw.notes === "string"
        ? raw.notes
        : null;

  return {
    id,
    applicant,
    document: documentName,
    college,
    window,
    submittedAt,
    status: normalizeStatus(typeof raw.status === "string" ? raw.status : null),
    purpose,
    createdAt:
      typeof raw.createdAt === "string" ? raw.createdAt : submittedAt,
  };
}

async function loadRequestRows(): Promise<RequestRow[]> {
  for (const endpoint of REQUEST_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, { credentials: "include" });

      if (response.status === 404) continue;
      if (!response.ok) {
        throw new Error(`${endpoint} responded ${response.status}`);
      }

      const payload = await response.json();
      const rows = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.results)
            ? payload.results
            : [];

      return rows
        .map((item: unknown) => normalizeRequestRow(item as Record<string, unknown>))
        .filter((item: RequestRow | null): item is RequestRow => Boolean(item));
    } catch (error) {
      console.warn(`Request endpoint unavailable: ${endpoint}`, error);
    }
  }

  return [];
}

function AllRequest() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [collegeFilter, setCollegeFilter] = useState("all");
  const [windowFilter, setWindowFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
  const [dataSourceNote, setDataSourceNote] = useState(
    "No request records are available yet. The backend request API has not been exposed in the current project state.",
  );

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const rows = await loadRequestRows();
        if (!isMounted) return;

        setRequests(rows);
        setDataSourceNote(
          rows.length > 0
            ? "Live request data is active. College and window filters are derived from the available request fields."
            : "No request records are available from the current data source. Once the request endpoint exposes requests, this table will populate automatically.",
        );
      } catch (error) {
        console.error("Failed to load request rows:", error);
        if (isMounted) {
          setRequests([]);
          setDataSourceNote(
            "The request data source is not available in this project yet. This page is ready to consume real request records as soon as the backend exposes them.",
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, []);

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
        [request.applicant, request.document, request.id, request.window ?? "", request.college ?? ""]
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
    <div className="h-full overflow-auto p-6 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <RequestHeader
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          collegeFilter={collegeFilter}
          onCollegeChange={setCollegeFilter}
          windowFilter={windowFilter}
          onWindowChange={setWindowFilter}
          collegeOptions={collegeOptions}
          windowOptions={windowOptions}
        />

        <RequestSummary
          total={summary.total}
          pending={summary.pending}
          processing={summary.processing}
          ready={summary.ready}
        />

        {dataSourceNote && (
          <p className="mb-4 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {dataSourceNote}
          </p>
        )}

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading requests...
          </div>
        ) : (
          <RequestTable
            rows={filteredRows}
            selectedRequest={selectedRequest}
            onViewRequest={setSelectedRequest}
            onCloseRequest={() => setSelectedRequest(null)}
            emptyMessage={
              requests.length === 0
                ? "No request records are available from the current backend data source yet."
                : "No requests match your current filters."
            }
          />
        )}
      </div>
    </div>
  );
}

export default AllRequest;