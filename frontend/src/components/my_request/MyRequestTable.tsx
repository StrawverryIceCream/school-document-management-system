import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentRequest } from "@/types";
import { useMyRequest } from "@/hooks/useMyRequest";
import MyRequestDetails from "./MyRequestDetails";

type MyRequestTableProps = {
  documentNames: Record<number, string>;
  getStatusBadgeClasses: (status: DocumentRequest["status"]) => string;
};

function MyRequestTable({
  documentNames,
  getStatusBadgeClasses,
}: MyRequestTableProps) {
  const { filteredRequests } = useMyRequest();

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead className="w-32.5">Request ID</TableHead>
            <TableHead>Document</TableHead>
            <TableHead>Date Requested</TableHead>
            <TableHead>Request Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredRequests.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="py-12 text-center text-muted-foreground"
              >
                No requests match your current filters.
              </TableCell>
            </TableRow>
          ) : (
            filteredRequests.map((request) => (
              <TableRow key={request.id} className="align-middle">
                <TableCell className="font-medium">
                  REQ-{request.id}
                </TableCell>
                <TableCell>
                  {documentNames[request.documentTypeId] ??
                    `Document #${request.documentTypeId}`}
                </TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClasses(request.status)}`}
                  >
                    {request.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <MyRequestDetails request={request} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default MyRequestTable;
