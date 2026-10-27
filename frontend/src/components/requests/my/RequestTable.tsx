import { useMemo, useState } from "react";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import RequestActionButton from "./RequestActionButton";
import RequestStatusBadge from "./RequestStatusBadge";
import RequestTimelineDialog from "./RequestTimelineDialog";
import { ClaimSlipDialog } from "./ClaimSlipDialog";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import { useMyRequest } from "@/hooks/useMyRequest";
import {
  formatFilingDate,
  formatFilingTime,
  formatRequestReference,
} from "@/lib/format";
import {
  NO_PURPOSE_LABEL,
  REQUEST_STATUS_CONFIG,
  REQUESTS_PAGE_SIZE,
} from "@/lib/requests";

export type RequestsTableProps = {
  requests: MyRequestWithDocumentName[];
  page: number;
  onPageChange: (page: number) => void;
};

export default function RequestsTable({
  requests,
  page,
  onPageChange,
}: RequestsTableProps) {
  const { filteredRequests, loading, error } = useMyRequest();
  const [selectedTimelineRequest, setSelectedTimelineRequest] =
    useState<MyRequestWithDocumentName | null>(null);
  const [selectedClaimSlipRequest, setSelectedClaimSlipRequest] =
    useState<MyRequestWithDocumentName | null>(null);

  const columns: DataTableColumn<MyRequestWithDocumentName>[] = useMemo(
    () => [
      {
        key: "reference",
        header: "Request Reference",
        cell: (request) => {
          const StatusIcon = REQUEST_STATUS_CONFIG[request.status].icon;
          return (
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <StatusIcon className="size-4" aria-hidden="true" />
              </div>
              <span className="font-mono text-sm font-semibold text-foreground">
                {formatRequestReference(request.id)}
              </span>
            </div>
          );
        },
      },
      {
        key: "document",
        header: "Document Requested",
        cell: (request) => (
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground">
              {request.documentName}
            </span>
            <span className="text-sm text-muted-foreground">
              {request.purpose ?? NO_PURPOSE_LABEL}
            </span>
          </div>
        ),
      },
      {
        key: "filingDate",
        header: "Filing Date",
        cell: (request) => (
          <div className="flex flex-col">
            <span className="text-base font-semibold text-foreground">
              {formatFilingDate(request.createdAt)}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {formatFilingTime(request.createdAt)}
            </span>
          </div>
        ),
      },
      {
        key: "status",
        header: "Current Status",
        cell: (request) => <RequestStatusBadge status={request.status} />,
      },
      {
        key: "actions",
        header: "Action",
        className: "text-right",
        headerClassName: "text-right",
        cell: (request) => (
          <RequestActionButton
            request={request}
            onTrackTimeline={() => setSelectedTimelineRequest(request)}
            onClaimSlip={() => setSelectedClaimSlipRequest(request)}
          />
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / REQUESTS_PAGE_SIZE),
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={requests}
        keyExtractor={(request) => request.id}
        loading={loading}
        error={error}
        emptyMessage="No requests match your search or filter."
        pagination={{
          page,
          totalPages,
          totalItems: filteredRequests.length,
          itemsPerPage: REQUESTS_PAGE_SIZE,
          itemLabel: "requests",
          onPageChange,
        }}
      />
      <RequestTimelineDialog
        request={selectedTimelineRequest}
        open={selectedTimelineRequest !== null}
        onOpenChange={(open) => !open && setSelectedTimelineRequest(null)}
        onOpenClaimSlip={(req) => {
          setSelectedTimelineRequest(null);
          setSelectedClaimSlipRequest(req);
        }}
      />
      <ClaimSlipDialog
        request={selectedClaimSlipRequest}
        open={selectedClaimSlipRequest !== null}
        onOpenChange={(open) => !open && setSelectedClaimSlipRequest(null)}
      />
    </>
  );
}
