import { useMemo, useState } from "react";
import { Eye, FileText } from "lucide-react";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import TruncatedText from "@/components/shared/TruncatedText";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import RequestDetailsDialog from "./RequestDetailsDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRequests } from "@/hooks/useRequest";
import { getInitials } from "@/lib/profile";
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
        className: "w-36",
        cell: (req) => (
          <CopyableId
            id={req.id}
            displayValue={`#${req.id}`}
            label={`Copy request #${req.id}`}
          />
        ),
      },
      {
        key: "applicant",
        header: "Applicant",
        className: "min-w-56 max-w-xs",
        cell: (req) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                {getInitials(req.applicant)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              {req.userId ? (
                <ProfileTrigger userId={req.userId}>
                  <button
                    type="button"
                    className="truncate text-left font-semibold text-foreground hover:underline"
                  >
                    <TruncatedText
                      text={req.applicant}
                      className="font-semibold text-foreground max-w-40"
                    />
                  </button>
                </ProfileTrigger>
              ) : (
                <TruncatedText
                  text={req.applicant}
                  className="font-semibold text-foreground max-w-40"
                />
              )}
              <span className="text-xs text-muted-foreground">Student</span>
            </div>
          </div>
        ),
      },
      {
        key: "document",
        header: "Document",
        className: "min-w-48 max-w-xs",
        cell: (req) => (
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <TruncatedText
              text={req.document}
              className="font-medium text-foreground max-w-52"
            />
          </div>
        ),
      },
      {
        key: "window",
        header: "Window",
        className: "w-36",
        cell: (req) => (
          <TruncatedText
            text={req.course ?? "Not available"}
            className="text-sm text-muted-foreground max-w-32"
          />
        ),
      },
      {
        key: "submitted",
        header: "Submitted",
        className: "w-32 text-sm text-muted-foreground",
        cell: (req) => req.submittedAt ?? "Not available",
      },
      {
        key: "status",
        header: "Status",
        className: "w-32",
        cell: (req) => <RequestStatusBadge status={req.status} />,
      },
      {
        key: "actions",
        header: "Action",
        className: "w-20 text-right",
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
