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
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-32.5">Request ID</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Request Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
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
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

export default MyRequestTable;
