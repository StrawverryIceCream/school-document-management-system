import { useState } from "react";
import { Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { formatDate, statusStyles } from "@/lib/utils";
import RequestDetailDialog from "@/components/dashboard/RequestDetailDialog";
import type { RequestRow } from "@/context/DashboardContext";

function RequestTable() {
  const { requests, loading, error } = useDashboard();
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  function handleViewClick(request: RequestRow) {
    setSelectedRequest(request);
    setDetailOpen(true);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading requests...</p>;
  }

  if (error) return null;

  return (
    <>
      <div className="flex-1 overflow-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Window</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell>{r.applicant}</TableCell>
                  <TableCell>{r.document}</TableCell>
                  <TableCell>{r.college}</TableCell>
                  <TableCell>{r.window}</TableCell>
                  <TableCell>{formatDate(r.submittedAt)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize ${statusStyles[r.status]}`}>
                      {r.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`View request ${r.id}`}
                      onClick={() => handleViewClick(r)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RequestDetailDialog
        request={selectedRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
}

export default RequestTable;