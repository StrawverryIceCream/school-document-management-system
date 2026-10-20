import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import TruncatedText from "@/components/shared/TruncatedText";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import RequestDetailDialog from "@/components/dashboard/RequestDetailDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { getInitials } from "@/lib/profile";
import type { RequestRow } from "@/context/DashboardContext";

export default function RequestTable() {
  const { requests, loading, error } = useDashboard();
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function handleViewClick(request: RequestRow) {
    setSelectedRequest(request);
    setDetailOpen(true);
  }

  const columns: DataTableColumn<RequestRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        className: "w-36",
        cell: (row) => (
          <CopyableId
            id={row.id}
            displayValue={`#${row.id}`}
            label={`Copy request #${row.id}`}
          />
        ),
      },
      {
        key: "applicant",
        header: "Applicant",
        className: "min-w-56 max-w-xs",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                {getInitials(row.applicant)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              {row.userId ? (
                <ProfileTrigger userId={row.userId}>
                  <button
                    type="button"
                    className="truncate text-left font-semibold text-foreground hover:underline"
                  >
                    <TruncatedText
                      text={row.applicant}
                      className="font-semibold text-foreground max-w-40"
                    />
                  </button>
                </ProfileTrigger>
              ) : (
                <TruncatedText
                  text={row.applicant}
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
        cell: (row) => (
          <TruncatedText
            text={row.document}
            className="font-medium text-foreground max-w-52"
          />
        ),
      },
      {
        key: "college",
        header: "College",
        className: "w-36",
        cell: (row) => (
          <TruncatedText
            text={row.college ?? "—"}
            className="text-sm text-muted-foreground max-w-32"
          />
        ),
      },
      {
        key: "course",
        header: "Course",
        className: "w-36",
        cell: (row) => (
          <TruncatedText
            text={row.course ?? "—"}
            className="text-sm text-muted-foreground max-w-32"
          />
        ),
      },
      {
        key: "submitted",
        header: "Submitted",
        className: "w-32 text-sm text-muted-foreground",
        cell: (row) =>
          row.submittedAt
            ? new Date(row.submittedAt).toLocaleDateString()
            : "—",
      },
      {
        key: "status",
        header: "Status",
        className: "w-32",
        cell: (row) => <RequestStatusBadge status={row.status} />,
      },
      {
        key: "actions",
        header: "Action",
        className: "w-20 text-right",
        headerClassName: "text-right",
        cell: (row) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewClick(row)}
            aria-label={`View details of request #${row.id}`}
          >
            <Eye className="size-4" />
          </Button>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const pagedData = requests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(row) => row.id}
        loading={loading}
        error={error}
        emptyMessage="No requests found."
        pagination={{
          page,
          totalPages,
          totalItems: requests.length,
          itemsPerPage: pageSize,
          itemLabel: "requests",
          onPageChange: setPage,
        }}
      />

      <RequestDetailDialog
        request={selectedRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}
