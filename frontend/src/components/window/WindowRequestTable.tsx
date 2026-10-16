import { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  EllipsisVertical,
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useWindowView } from "@/hooks/useWindowView";
import { statusStyles } from "@/lib/request";
import { cn } from "@/lib/utils";
import {
  REQUEST_STATUS_OPTIONS,
  REQUEST_WINDOWS,
  WINDOW_REQUEST_PAGE_SIZE,
} from "@/lib/window-requests";

export function WindowRequestTable() {
  const {
    TILES,
    activeView,
    departmentRequests,
    requestWindowsById,
    visibleRequests,
    loading,
    error,
    documentFilter,
    windowFilter,
    currentPage,
    setCurrentPage,
    selectedIds,
    setSelectedIds,
    setSelectedRequestId,
    updateRequestStatus,
  } = useWindowView();

  const college = TILES.find((tile) => tile.id === activeView);
  const collegeTitle = college?.title ?? activeView ?? "Department";
  const collegeDescription = college?.description ?? collegeTitle;

  const filteredRequests = useMemo(
    () =>
      visibleRequests.filter((request) => {
        const matchesDocument =
          documentFilter === "all" ||
          request.documentType?.name === documentFilter;
        const matchesWindow =
          windowFilter === "all" ||
          requestWindowsById[String(request.id)] === windowFilter;
        return matchesDocument && matchesWindow;
      }),
    [documentFilter, requestWindowsById, visibleRequests, windowFilter],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRequests.length / WINDOW_REQUEST_PAGE_SIZE),
  );
  const safePage = Math.min(currentPage, pageCount);
  const pageRequests = filteredRequests.slice(
    (safePage - 1) * WINDOW_REQUEST_PAGE_SIZE,
    safePage * WINDOW_REQUEST_PAGE_SIZE,
  );
  const allPageRowsSelected =
    pageRequests.length > 0 &&
    pageRequests.every((request) => selectedIds.includes(String(request.id)));
  const startResult =
    filteredRequests.length === 0
      ? 0
      : (safePage - 1) * WINDOW_REQUEST_PAGE_SIZE + 1;
  const endResult = Math.min(
    safePage * WINDOW_REQUEST_PAGE_SIZE,
    filteredRequests.length,
  );

  return (
    <section
      aria-label="Requests"
      className="overflow-hidden rounded-xl border bg-card"
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Loading requests...
        </div>
      ) : error ? (
        <div role="alert" className="p-8 text-center text-sm text-destructive">
          {error}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table className="min-w-[920px]">
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-10">
                    <Checkbox
                      aria-label="Select all requests on this page"
                      checked={allPageRowsSelected}
                      onCheckedChange={(checked) =>
                        setSelectedIds((current) =>
                          checked
                            ? Array.from(
                                new Set([
                                  ...current,
                                  ...pageRequests.map((request) =>
                                    String(request.id),
                                  ),
                                ]),
                              )
                            : current.filter(
                                (id) =>
                                  !pageRequests.some(
                                    (request) => String(request.id) === id,
                                  ),
                              ),
                        )
                      }
                    />
                  </TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Routing</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="h-36 text-center text-muted-foreground"
                    >
                      {departmentRequests.length === 0
                        ? `No requests are currently assigned to ${collegeDescription}.`
                        : "No requests match these filters."}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageRequests.map((request) => {
                    const requester = request.user?.fullName ?? "Unknown";
                    const initials = requester
                      .split(/\s+/)
                      .map((part) => part.charAt(0))
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                    const windowId =
                      requestWindowsById[String(request.id)] ?? "window-1";
                    const requestWindow = REQUEST_WINDOWS.find(
                      (item) => item.id === windowId,
                    );

                    return (
                      <TableRow key={request.id} className="align-middle">
                        <TableCell>
                          <Checkbox
                            aria-label={`Select request from ${requester}`}
                            checked={selectedIds.includes(String(request.id))}
                            onCheckedChange={(checked) =>
                              setSelectedIds((current) =>
                                checked
                                  ? [...current, String(request.id)]
                                  : current.filter(
                                      (id) => id !== String(request.id),
                                    ),
                              )
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                              {initials || "?"}
                            </span>
                            <div className="min-w-0">
                              {request.user ? (
                                <ProfileTrigger userId={request.user.id}>
                                  <button
                                    type="button"
                                    className="max-w-40 truncate text-left text-sm font-medium hover:underline"
                                  >
                                    {requester}
                                  </button>
                                </ProfileTrigger>
                              ) : (
                                <span className="text-sm font-medium">
                                  {requester}
                                </span>
                              )}
                              <p className="text-sm text-muted-foreground">
                                ID: {request.user?.studentId ?? "—"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="border-transparent bg-muted text-muted-foreground font-normal capitalize"
                          >
                            {request.user?.role ?? "—"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-52">
                          <p className="font-medium">
                            {request.documentType?.name ?? "Unknown document"}
                          </p>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {request.purpose ??
                              request.documentType?.description ??
                              "Document request"}
                          </p>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-sm">
                          {request.createdAt
                            ? new Date(request.createdAt).toLocaleDateString(
                                "en-US",
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "gap-1.5 rounded-full px-2.5 py-1 font-medium",
                              statusStyles[request.status],
                            )}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {REQUEST_STATUS_OPTIONS.find(
                              (status) => status.id === request.status,
                            )?.label ?? request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <span
                              aria-label={`Window ${windowId.split("-")[1]}`}
                              className="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/70 text-xs font-semibold leading-none text-muted-foreground"
                            >
                              {windowId.split("-")[1]}
                            </span>
                            {requestWindow?.label.split(" (")[0] ?? "Window 1"}
                          </div>
                        </TableCell>
                        <TableCell className="align-middle">
                          <div className="flex w-full items-center justify-between gap-1.5">
                            <Button
                              variant="ghost"
                              size="sm"
                              aria-label={`Review details for ${requester}`}
                              className="h-12 w-24 flex-col gap-0 rounded-lg bg-muted/70 px-2 py-1 text-sm font-medium leading-tight whitespace-normal text-primary hover:bg-muted hover:text-primary"
                              onClick={() =>
                                setSelectedRequestId(String(request.id))
                              }
                            >
                              <span>Review</span>
                              <span>Details</span>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`More actions for ${requester}`}
                                  className="size-8 shrink-0"
                                >
                                  <EllipsisVertical
                                    className="size-4"
                                    aria-hidden="true"
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {REQUEST_STATUS_OPTIONS.map(
                                  ({ id: status, label }) => (
                                    <DropdownMenuItem
                                      key={status}
                                      disabled={request.status === status}
                                      onSelect={async () => {
                                        try {
                                          await updateRequestStatus(
                                            String(request.id),
                                            status,
                                          );
                                          toast.success(
                                            `Request marked ${label.toLowerCase()}.`,
                                          );
                                        } catch (err) {
                                          toast.error(
                                            err instanceof Error
                                              ? err.message
                                              : "Could not update request status.",
                                          );
                                        }
                                      }}
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
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/30 px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Showing {startResult}–{endResult} of {filteredRequests.length}{" "}
              {collegeTitle} requests
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
              >
                <ChevronLeft className="size-3.5" aria-hidden="true" />
                Previous
              </Button>
              <span className="whitespace-nowrap">
                Page {safePage} of {pageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                disabled={safePage >= pageCount}
                onClick={() =>
                  setCurrentPage(Math.min(pageCount, safePage + 1))
                }
              >
                Next
                <ChevronRight className="size-3.5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
