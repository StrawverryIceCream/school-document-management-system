import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import RequestActionButton from "@/components/my_request/RequestActionButton";
import RequestStatusBadge from "@/components/my_request/RequestStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";
import {
  formatFilingDate,
  formatFilingTime,
  formatRequestReference,
} from "@/lib/format";
import {
  NO_PURPOSE_LABEL,
  REQUEST_STATUS_CONFIG,
  REQUESTS_PAGE_SIZE,
} from "@/lib/request";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useMyRequest } from "@/hooks/useMyRequest";

const COLUMN_COUNT = 5;

const HEAD_CLASS_NAME =
  "h-12 text-base font-semibold uppercase text-mono tracking-wide text-muted-foreground";

const MESSAGE_CELL_CLASS_NAME =
  "px-6 py-10 text-center text-base text-muted-foreground";

export type RequestsTableProps = {
  requests: MyRequestWithDocumentName[];
  page: number;
  onPageChange: (page: number) => void;
};

function RequestsTable({ requests, page, onPageChange }: RequestsTableProps) {
  const { filteredRequests, loading, error, refreshMyRequests } =
    useMyRequest();
  const navigate = useNavigate();

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRequests.length / REQUESTS_PAGE_SIZE),
  );

  const isFirstPage = page <= 1;
  const isLastPage = page >= pageCount;

  return (
    <div className={cn("overflow-hidden rounded-2xl bg-card shadow-sm")}>
      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            <TableHead className={cn(HEAD_CLASS_NAME, "px-6")}>
              Request Reference
            </TableHead>
            <TableHead className={HEAD_CLASS_NAME}>
              Document Requested
            </TableHead>
            <TableHead className={HEAD_CLASS_NAME}>Filing Date</TableHead>
            <TableHead className={HEAD_CLASS_NAME}>Current Status</TableHead>
            <TableHead className={cn(HEAD_CLASS_NAME, "px-6 text-right")}>
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMN_COUNT}
                className={MESSAGE_CELL_CLASS_NAME}
              >
                <span className="inline-flex items-center gap-2" role="status">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Loading your requests...
                </span>
              </TableCell>
            </TableRow>
          ) : error ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMN_COUNT}
                className={MESSAGE_CELL_CLASS_NAME}
              >
                <div className="flex flex-col items-center gap-3" role="alert">
                  <p className="text-destructive">{error}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void refreshMyRequests()}
                  >
                    Try again
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : requests.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={COLUMN_COUNT}
                className={MESSAGE_CELL_CLASS_NAME}
              >
                No requests match your search or filter.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => {
              const StatusIcon = REQUEST_STATUS_CONFIG[request.status].icon;

              return (
                <TableRow key={request.id}>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <StatusIcon className="size-4" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {formatRequestReference(request.id)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-lg font-semibold text-foreground">
                        {request.documentName}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {request.purpose ?? NO_PURPOSE_LABEL}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-foreground">
                        {formatFilingDate(request.createdAt)}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {formatFilingTime(request.createdAt)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <RequestStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <RequestActionButton
                      request={request}
                      onTrackTimeline={(id) =>
                        navigate(`/requests/${id}/timeline`)
                      }
                      onClaimSlip={(id) => navigate(`/requests/${id}/timeline`)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-col gap-3 bg-muted/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {requests.length} of {filteredRequests.length} requests
        </p>
        <nav
          aria-label="Requests pagination"
          className="flex items-center gap-3"
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isFirstPage}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            Page {page} of {pageCount}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={isLastPage}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>
        </nav>
      </div>
    </div>
  );
}

export default RequestsTable;
