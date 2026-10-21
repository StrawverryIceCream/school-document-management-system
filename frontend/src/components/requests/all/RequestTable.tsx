import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, ExternalLink, Eye, FileText } from "lucide-react";
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
import { findOfficeRoute } from "@/lib/sectors/sectors-config";
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
        key: "office",
        header: "Office",
        className: "min-w-44 max-w-xs",
        cell: (req) => {
          const route = findOfficeRoute({
            officeCode: req.officeCode,
            officeId: req.officeId,
            officeName: req.officeName,
            sector: req.sector,
            documentTypeCode: req.documentTypeCode,
            college: req.college,
          });

          const officeCode = req.officeCode || route?.office.code || "OUR";
          const officeName =
            req.officeName ||
            route?.office.name ||
            (req.officeCode ? `Office (${req.officeCode})` : "University Office");
          const targetUrl = route?.url;

          const artifact = (
            <div className="group/office inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card px-2.5 py-1 text-xs shadow-xs transition-colors hover:border-primary/50 hover:bg-muted/60">
              <Building2 className="size-3.5 shrink-0 text-muted-foreground group-hover/office:text-primary transition-colors" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground group-hover/office:text-primary transition-colors">
                    {officeCode}
                  </span>
                  {targetUrl && (
                    <ExternalLink className="size-3 text-muted-foreground/60 group-hover/office:text-primary transition-colors" />
                  )}
                </div>
                <TruncatedText
                  text={officeName}
                  className="text-[11px] text-muted-foreground max-w-36"
                />
              </div>
            </div>
          );

          if (targetUrl) {
            return (
              <Link
                to={targetUrl}
                className="inline-block rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
                title={`Go to ${officeName} (${officeCode}) workspace`}
                aria-label={`Go to ${officeName} (${officeCode}) workspace`}
              >
                {artifact}
              </Link>
            );
          }

          return artifact;
        },
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
