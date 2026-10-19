import { useMemo, useState } from "react";
import { Eye, FileText, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import RequestDetailsDialog from "@/components/all_requests/RequestDetailsDialog";
import { useRequests } from "@/hooks/useRequest";
import { statusStyles } from "@/lib/request";
import type { RequestRow } from "@/context/DashboardContext";

export default function RequestTable() {
  const { filteredRows: rows, requests, error } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const emptyMessage = error
    ? error
    : requests.length === 0
      ? "No request records are available from the current backend data source yet."
      : "No requests match your current filters.";

  const columns: DataTableColumn<RequestRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        className: "w-24",
        cell: (req) => <span className="font-mono text-sm">#{req.id}</span>,
      },
      {
        key: "applicant",
        header: "Applicant",
        className: "min-w-45",
        cell: (req) => (
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UserRound className="size-4" />
            </div>
            <div>
              {req.userId ? (
                <ProfileTrigger userId={req.userId}>
                  <button
                    type="button"
                    className="text-left font-medium text-foreground hover:underline"
                  >
                    {req.applicant}
                  </button>
                </ProfileTrigger>
              ) : (
                <p className="font-medium text-foreground">{req.applicant}</p>
              )}
              <p className="text-xs text-muted-foreground">Student</p>
            </div>
          </div>
        ),
      },
      {
        key: "document",
        header: "Document",
        className: "min-w-45",
        cell: (req) => (
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <span>{req.document}</span>
          </div>
        ),
      },
      {
        key: "window",
        header: "Window",
        className: "min-w-35",
        cell: (req) => req.course ?? "Not available",
      },
      {
        key: "submitted",
        header: "Submitted",
        className: "min-w-35",
        cell: (req) => req.submittedAt ?? "Not available",
      },
      {
        key: "status",
        header: "Status",
        className: "w-32",
        cell: (req) => (
          <Badge
            variant="outline"
            className={`capitalize ${statusStyles[req.status] ?? ""}`}
          >
            {req.status}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Action",
        className: "w-24 text-right",
        headerClassName: "text-right",
        cell: (req) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedRequest(req)}
            aria-label={`View details of request #${req.id}`}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pagedData = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(req) => req.id}
        error={error}
        emptyMessage={emptyMessage}
        pagination={{
          page,
          totalPages,
          totalItems: rows.length,
          itemsPerPage: pageSize,
          itemLabel: "requests",
          onPageChange: setPage,
        }}
      />

      <RequestDetailsDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}
