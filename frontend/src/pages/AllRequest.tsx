import { useEffect, useMemo, useState } from "react";
import RequestHeader, {
  type StatusFilter,
} from "@/components/all_requests/RequestHeader";
import RequestSummary from "@/components/all_requests/RequestSummary";
import RequestTable, {
  type RequestRow,
} from "@/components/all_requests/RequestTable";
import { getAllRequests } from "@/api/requests";

const collegeOptions = [
  "College of Science (COS)",
  "College of Engineering (COE)",
  "College of Industrial Technology (CIT)",
  "College of Industrial Education (CIE)",
  "College of Architecture and Fine Arts (CAFA)",
  "College of Management and Multidisciplinary Studies (CMMS)",
] as const;

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
        const rows = await getAllRequests();
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
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full">
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