import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import RequestDetailDialog from "@/components/dashboard_page/RequestDetailDialog";
import { useDashboard } from "@/hooks/useDashboard";
import { statusStyles } from "@/lib/request";
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
        className: "w-24",
        cell: (row) => <span className="font-mono text-xs">#{row.id}</span>,
      },
      {
        key: "applicant",
        header: "Applicant",
        cell: (row) =>
          row.userId ? (
            <ProfileTrigger userId={row.userId}>
              <button
                type="button"
                className="text-left font-medium hover:underline"
              >
                {row.applicant}
              </button>
            </ProfileTrigger>
          ) : (
            <span className="font-medium">{row.applicant}</span>
          ),
      },
      {
        key: "document",
        header: "Document",
        accessor: "document",
      },
      {
        key: "college",
        header: "College",
        cell: (row) => row.college ?? "—",
      },
      {
        key: "course",
        header: "Course",
        cell: (row) => row.course ?? "—",
      },
      {
        key: "submitted",
        header: "Submitted",
        cell: (row) =>
          row.submittedAt
            ? new Date(row.submittedAt).toLocaleDateString()
            : "—",
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => (
          <Badge
            variant="outline"
            className={`capitalize ${statusStyles[row.status] ?? ""}`}
          >
            {row.status}
          </Badge>
        ),
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
