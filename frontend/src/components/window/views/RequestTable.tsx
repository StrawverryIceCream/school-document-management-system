import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { SearchIcon } from "lucide-react";
import { MOCK_REQUESTS } from "@/data/mockRequests";
import type { RequestStatus } from "@/types/request";
import type { WindowViewId } from "@/types/window";

type RequestTableProps = {
  collegeId: WindowViewId;
  collegeTitle: string;
  onBack: () => void;
};

type StatusFilter = "all" | RequestStatus;

const STATUS_LABELS: Record<RequestStatus, string> = {
  processing: "Processing",
  done: "Done",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  processing: "text-orange-500",
  done: "text-green-600",
  cancelled: "text-destructive",
};

function RequestTable({ collegeId, collegeTitle, onBack }: RequestTableProps) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RequestStatus>>({});
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  const collegeRequests = MOCK_REQUESTS
    .filter((r) => r.college === collegeId)
    .map((r) => ({ ...r, status: statusOverrides[r.id] ?? r.status }))
    .sort((a, b) => b.dateRequested.localeCompare(a.dateRequested));

    const visibleRequests = collegeRequests
    .filter((r) => filter === "all" || r.status === filter)
    .filter((r) => {
        const query = search.trim().toLowerCase();
        if (!query) return true;
        return (
        r.requesterName.toLowerCase().includes(query) ||
        r.documentType.toLowerCase().includes(query)
        );
    });

  function handleStatusChange(id: string, status: RequestStatus) {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{collegeTitle} Requests</CardTitle>
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </CardHeader>

    <div className="px-(--card-spacing) pb-2">
    <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
        placeholder="Search by requester or document type"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-8"
        />
    </div>
    </div>

      <div className="px-(--card-spacing)">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="done">Done</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="px-(--card-spacing) pb-(--card-spacing)">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.requesterName}</TableCell>
                <TableCell className="capitalize">{request.requesterRole}</TableCell>
                <TableCell>{request.documentType}</TableCell>
                <TableCell>{request.dateRequested}</TableCell>
                <TableCell>
                  <Select
                    value={request.status}
                    onValueChange={(value) =>
                      handleStatusChange(request.id, value as RequestStatus)
                    }
                  >
                    <SelectTrigger size="sm" className={STATUS_COLORS[request.status]}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {visibleRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

export default RequestTable;