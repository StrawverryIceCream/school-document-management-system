import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { Eye, FileText, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import RequestDetailsDialog from "@/components/all_requests/RequestDetailsDialog";
import { useRequests } from "@/hooks/useRequests";
import type { RequestRow } from "@/context/DashboardContext";
import { statusStyles } from "@/lib/utils";

function RequestTable() {
  const { filteredRows: rows, requests, error } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(
    null,
  );
  const emptyMessage = error
    ? error
    : requests.length === 0
      ? "No request records are available from the current backend data source yet."
      : "No requests match your current filters.";

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="min-w-45">Applicant</TableHead>
              <TableHead className="min-w-45">Document</TableHead>
              <TableHead className="min-w-35">Window</TableHead>
              <TableHead className="min-w-35">Submitted</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-12 text-center text-muted-foreground"
                >
                  {emptyMessage}
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
                        {request.userId ? (
                          <ProfileTrigger userId={request.userId}>
                            <button
                              type="button"
                              className="text-left font-medium text-foreground hover:underline"
                            >
                              {request.applicant}
                            </button>
                          </ProfileTrigger>
                        ) : (
                          <p className="font-medium text-foreground">
                            {request.applicant}
                          </p>
                        )}
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
                  <TableCell>{request.course ?? "Not available"}</TableCell>
                  <TableCell>
                    {request.submittedAt ?? "Not available"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${statusStyles[request.status]}`}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setSelectedRequest(request)}
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

      <RequestDetailsDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}

export default RequestTable;
