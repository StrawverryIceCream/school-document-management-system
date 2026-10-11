import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyRequest } from "@/hooks/useMyRequest";
import MyRequestDetails from "./MyRequestDetails";
import { Badge } from "../ui/badge";
import { statusStyles } from "@/lib/request";



function MyRequestTable() {
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
                  {request.id}
                </TableCell>
                <TableCell>
                  {request.documentName}
                </TableCell>
                <TableCell>
                  {new Date(request.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
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
