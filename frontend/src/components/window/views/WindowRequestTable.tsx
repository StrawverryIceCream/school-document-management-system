import { ArrowLeft, EllipsisVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useWindowView } from "@/hooks/useWindowView";
import { useWindowRequests } from "@/hooks/useWindowRequests";
import type { RequestStatus } from "@/types/request";
import type { WindowViewId } from "@/types/window";

type WindowRequestTableProps = {
  collegeId: WindowViewId;
};

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

function WindowRequestTable({ collegeId }: WindowRequestTableProps) {
  const { clearView } = useWindowView();
  const {
    collegeTitle,
    filter,
    setFilter,
    search,
    setSearch,
    visibleRequests,
    handleStatusChange,
  } = useWindowRequests(collegeId);

  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <div className="mb-8">
          <Button variant="ghost" size="sm" onClick={clearView} className="mb-2 -ml-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-normal">
            {collegeTitle} Requests
          </h1>
          <p className="text-sm mt-2">
            All document requests submitted by {collegeTitle} students and professors
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search requester or document"
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList className="h-10">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="done">Done</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Table>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow>
              <TableHead>Requester</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.requesterName}</TableCell>
                <TableCell className="capitalize">{request.requesterRole}</TableCell>
                <TableCell>{request.documentType}</TableCell>
                <TableCell>{request.dateRequested}</TableCell>
                <TableCell className={STATUS_COLORS[request.status]}>
                  {STATUS_LABELS[request.status]}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                          size="icon"
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36">
                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                          <DropdownMenuItem
                            key={value}
                            onClick={() =>
                              handleStatusChange(request.id, value as RequestStatus)
                            }
                          >
                            Mark as {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {visibleRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default WindowRequestTable;
