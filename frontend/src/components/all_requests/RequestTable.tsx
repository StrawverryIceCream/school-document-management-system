import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileText, UserRound } from "lucide-react";
import type { RequestRow } from "@/types";
import RequestDetailsDialog from "@/components/all_requests/RequestDetailsDialog";

export type { RequestRow } from "@/types";

interface RequestTableProps {
  rows: RequestRow[];
  onViewRequest: (request: RequestRow) => void;
  selectedRequest: RequestRow | null;
  onCloseRequest: () => void;
  emptyMessage?: string;
}

const statusTone: Record<RequestRow["status"], string> = {
  pending: "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/30 dark:text-amber-300",
  processing: "bg-sky-500/15 text-sky-700 ring-1 ring-sky-500/30 dark:text-sky-300",
  ready: "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/30 dark:text-emerald-300",
  claimed: "bg-violet-500/15 text-violet-700 ring-1 ring-violet-500/30 dark:text-violet-300",
  cancelled: "bg-red-500/15 text-red-700 ring-1 ring-red-500/30 dark:text-red-300",
  rejected: "bg-red-500/15 text-red-700 ring-1 ring-red-500/30 dark:text-red-300",
};

function RequestTable({
  rows,
  onViewRequest,
  selectedRequest,
  onCloseRequest,
  emptyMessage,
}: RequestTableProps) {

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="min-w-45">Applicant</TableHead>
              <TableHead className="min-w-45">Document</TableHead>
              <TableHead className="min-w-37.5">College</TableHead>
              <TableHead className="min-w-35">Window</TableHead>
              <TableHead className="min-w-35">Submitted</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                  {emptyMessage ?? "No requests match your current filters."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((request) => (
                <TableRow key={request.id} className="align-middle">
                  <TableCell className="font-medium">#{request.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <UserRound className="size-4" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{request.applicant}</p>
                        <p className="text-xs text-muted-foreground">Student</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <span>{request.document}</span>
                    </div>
                  </TableCell>
                  <TableCell>{request.college ?? "Not available"}</TableCell>
                  <TableCell>{request.window ?? "Not available"}</TableCell>
                  <TableCell>{request.submittedAt ?? "Not available"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusTone[request.status]}`}>
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => onViewRequest(request)}
                    >
                      <Eye className="size-3.5" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RequestDetailsDialog request={selectedRequest} onClose={onCloseRequest} />
    </>
  );
}

export default RequestTable;
