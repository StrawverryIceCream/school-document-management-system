import { useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WindowRequestTableRow } from "@/components/window/WindowRequestTableRow";
import { useWindowView } from "@/hooks/useWindowView";
import { WINDOW_REQUEST_PAGE_SIZE } from "@/lib/windowRequests";

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
  } = useWindowView();
  const navigate = useNavigate();

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

  const handleSelectChange = useCallback(
    (id: string, checked: boolean) =>
      setSelectedIds((current) =>
        checked ? [...current, id] : current.filter((item) => item !== id),
      ),
    [setSelectedIds],
  );
  const handleReview = useCallback(
    (id: string) => navigate(`/windows/${activeView}/requests/${id}`),
    [navigate, activeView],
  );

  return (
    <section
      aria-label="Requests"
      className="overflow-hidden rounded-xl border border-border bg-card"
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
          <Table className="table-fixed">
            <TableHeader className="bg-muted/70">
              <TableRow>
                <TableHead className="w-[4%] whitespace-normal">
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
                <TableHead className="w-[19%] whitespace-normal">
                  Requester
                </TableHead>
                <TableHead className="w-[8%] whitespace-normal">Role</TableHead>
                <TableHead className="w-[21%] whitespace-normal">
                  Document Type
                </TableHead>
                <TableHead className="w-[10%] whitespace-normal">Date</TableHead>
                <TableHead className="w-[12%] whitespace-normal">
                  Status
                </TableHead>
                <TableHead className="w-[11%] whitespace-normal">
                  Routing
                </TableHead>
                <TableHead className="w-[15%] whitespace-normal text-right">
                  Action
                </TableHead>
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
                pageRequests.map((request) => (
                  <WindowRequestTableRow
                    key={request.id}
                    request={request}
                    windowId={requestWindowsById[String(request.id)]}
                    selected={selectedIds.includes(String(request.id))}
                    onSelectChange={handleSelectChange}
                    onReview={handleReview}
                  />
                ))
              )}
            </TableBody>
          </Table>
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
