import { ArrowLeft, EllipsisVertical, Search } from "lucide-react";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
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
import type { StatusFilter } from "@/context/WindowViewContext";
import type { DocumentRequest, RequestStatus } from "@/types";
import { useWindowView } from "@/hooks/useWindowView";

const STATUS_COLORS: Record<RequestStatus, string> = {
  pending: "text-orange-500",
  processing: "text-orange-500",
  ready: "text-green-600",
  claimed: "text-green-600",
  rejected: "text-destructive",
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: "PENDING",
  processing: "PROCESSING",
  ready: "READY",
  claimed: "CLAIMED",
  rejected: "REJECTED",
};

function WindowRequestTableView() {
  const {
    activeView,
    clearView,
    visibleRequests,
    loading,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    updateRequestStatus,
    TILES,
  } = useWindowView();

  const college = TILES.find((tile) => tile.id === activeView);
  const collegeTitle = college?.title ?? activeView;
  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full">
        <div className="mb-8 flex items-start justify-between gap-5">
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearView}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-normal">
              {collegeTitle} Requests
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              All document requests submitted by {collegeTitle} students and
              professors
            </p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search requester or document"
              className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Tabs
            value={filter}
            onValueChange={(v) => setFilter(v as StatusFilter)}
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
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading requests...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader className="bg-muted/70">
                <TableRow>
                  <TableHead>Requester</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground"
                    >
                      No requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRequests.map((request) => (
                    <TableRow key={request.id} className="align-middle">
                      <TableCell className="font-medium">
                        {request.user ? (
                          <ProfileTrigger userId={request.user.id}>
                            <button
                              type="button"
                              className="text-left font-medium text-foreground hover:underline"
                            >
                              {request.user.fullName}
                            </button>
                          </ProfileTrigger>
                        ) : (
                          "Unknown"
                        )}
                      </TableCell>
                      <TableCell className="capitalize">
                        {request.user?.role ?? "—"}
                      </TableCell>
                      <TableCell>
                        {request.documentType?.name ?? "Unknown document"}
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
                      <TableCell className="text-right">
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
                                      updateRequestStatus(
                                        String(request.id),
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

export default WindowRequestTableView;
