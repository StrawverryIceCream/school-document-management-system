import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RequestRow, RequestStatus } from "@/types";
import WindowRequestStatusBadge from "@/components/window/WindowRequestStatusBadge";
import WindowRequestStatusMenu from "@/components/window/WindowRequestStatusMenu";

interface WindowRequestTableProps {
  requests: RequestRow[];
  onUpdateStatus: (requestId: string, status: RequestStatus) => void;
}

function WindowRequestTable({ requests, onUpdateStatus }: WindowRequestTableProps) {
  return (
    <Table>
      <TableHeader
        style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--muted, #f3f4f6)" }}
      >
        <TableRow>
          <TableHead>Requester</TableHead>
          <TableHead>Document Type</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell style={{ fontWeight: 500 }}>{request.applicant}</TableCell>
            <TableCell>{request.document}</TableCell>
            <TableCell>
              {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "—"}
            </TableCell>
            <TableCell>
              <WindowRequestStatusBadge status={request.status} />
            </TableCell>
            <TableCell>
              <WindowRequestStatusMenu requestId={request.id} onSelectStatus={onUpdateStatus} />
            </TableCell>
          </TableRow>
        ))}
        {requests.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} style={{ textAlign: "center", color: "var(--muted-foreground)" }}>
              No requests found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export default WindowRequestTable;