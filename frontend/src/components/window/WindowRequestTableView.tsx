import { ArrowLeft, EllipsisVertical, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  RequestDocumentType,
  RequestUser,
  StatusFilter,
} from "@/context/WindowViewContext";
import type { DocumentRequest, RequestStatus } from "@/types";

type RequestTableViewProps = {
  collegeTitle: string;
  onBack: () => void;
  requests: DocumentRequest[];
  usersById: Map<number, RequestUser>;
  documentTypesById: Map<number, RequestDocumentType>;
  loading: boolean;
  error: string | null;
  filter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  search: string;
  onSearchChange: (search: string) => void;
  onStatusChange: (id: number, status: DocumentRequest["status"]) => void;
};


const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: "text-orange-500",
  processing: "text-orange-500",
  ready: "text-green-600",
  claimed: "text-green-600",
  rejected: "text-destructive",
}

const STATUS_LABELS : Record<RequestStatus, string> = {
  pending: "PENDING",
  processing: "PROCESSING",
  ready: "READY",
  claimed: "CLAIMED",
  rejected: "REJECTED",
}

function RequestTableView({
  collegeTitle,
  onBack,
  requests,
  usersById,
  documentTypesById,
  loading,
  error,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onStatusChange,
}: RequestTableViewProps) {
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold tracking-normal">
            {collegeTitle} Requests
          </h1>
          <p className="text-sm mt-2">
            All document requests submitted by {collegeTitle} students and
            professors
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search requester or document"
              className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => onFilterChange(v as StatusFilter)}
          >
            <TabsList className="h-10">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processing">Processing</TabsTrigger>
              <TabsTrigger value="ready">Ready</TabsTrigger>
              <TabsTrigger value="claimed">Claimed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading requests...</p>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : (
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
              {requests.map((request) => {
                const user = usersById.get(request.userId);
                const documentType = documentTypesById.get(
                  request.documentTypeId,
                );

                return (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {user?.fullName ?? "Unknown"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {user?.role ?? "—"}
                  </TableCell>
                  <TableCell>
                    {documentType?.name ?? "Unknown document"}
                  </TableCell>
                  <TableCell>
                    {request.createdAt
                      ? new Date(request.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell
                    className={
                      STATUS_COLORS[request.status] ?? "text-muted-foreground"
                    }
                  >
                    {STATUS_LABELS[request.status] ?? request.status}
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
                          {Object.entries(STATUS_LABELS).map(
                            ([value, label]) => (
                              <DropdownMenuItem
                                key={value}
                                onClick={() =>
                                  onStatusChange(
                                    request.id,
                                    value as DocumentRequest["status"],
                                  )
                                }
                              >
                                Mark as {label}
                              </DropdownMenuItem>
                            ),
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    No requests found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default RequestTableView;