import { useCallback, useMemo } from "react";
import { Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useWindowView } from "@/hooks/useWindowView";
import { statusStyles } from "@/lib/request";
import {
  REQUEST_STATUS_OPTIONS,
  REQUEST_WINDOWS,
  WINDOW_REQUEST_PAGE_SIZE,
} from "@/lib/windowRequests";
import type { DocumentRequestWithRelations } from "@/types";

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

  const somePageRowsSelected =
    pageRequests.some((request) => selectedIds.includes(String(request.id))) &&
    !allPageRowsSelected;

  const handleToggleAll = useCallback(
    (checked: boolean | "indeterminate") => {
      setSelectedIds((current) =>
        checked
          ? Array.from(
              new Set([
                ...current,
                ...pageRequests.map((request) => String(request.id)),
              ]),
            )
          : current.filter(
              (id) => !pageRequests.some((request) => String(request.id) === id),
            ),
      );
    },
    [pageRequests, setSelectedIds],
  );

  const handleSelectChange = useCallback(
    (id: string, checked: boolean) => {
      setSelectedIds((current) =>
        checked ? [...current, id] : current.filter((item) => item !== id),
      );
    },
    [setSelectedIds],
  );

  const handleReview = useCallback(
    (id: string) => navigate(`/windows/${activeView}/requests/${id}`),
    [navigate, activeView],
  );

  const columns: DataTableColumn<DocumentRequestWithRelations>[] = useMemo(
    () => [
      {
        key: "select",
        header: (
          <Checkbox
            aria-label="Select all requests on this page"
            checked={
              allPageRowsSelected
                ? true
                : somePageRowsSelected
                  ? "indeterminate"
                  : false
            }
            onCheckedChange={handleToggleAll}
          />
        ),
        className: "w-[4%] whitespace-normal",
        cell: (request) => {
          const id = String(request.id);
          const requester = request.user?.fullName ?? "Unknown";
          return (
            <Checkbox
              aria-label={`Select request from ${requester}`}
              checked={selectedIds.includes(id)}
              onCheckedChange={(checked) =>
                handleSelectChange(id, checked === true)
              }
            />
          );
        },
      },
      {
        key: "requester",
        header: "Requester",
        className: "w-[19%] whitespace-normal",
        cell: (request) => {
          const requester = request.user?.fullName ?? "Unknown";
          const initials = requester
            .split(/\s+/)
            .map((part) => part.charAt(0))
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                {initials || "?"}
              </span>
              <div className="min-w-0">
                {request.user ? (
                  <ProfileTrigger userId={request.user.id}>
                    <button
                      type="button"
                      className="max-w-40 truncate text-left font-medium text-foreground hover:underline"
                    >
                      {requester}
                    </button>
                  </ProfileTrigger>
                ) : (
                  <span className="font-medium text-foreground">
                    {requester}
                  </span>
                )}
                <p className="text-xs text-muted-foreground">
                  ID: {request.user?.studentId ?? "—"}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        key: "role",
        header: "Role",
        className: "w-[8%] whitespace-normal",
        cell: (request) => (
          <Badge
            variant="outline"
            className="border-transparent bg-muted text-muted-foreground font-normal capitalize"
          >
            {request.user?.role ?? "—"}
          </Badge>
        ),
      },
      {
        key: "documentType",
        header: "Document Type",
        className: "w-[21%] whitespace-normal break-words",
        cell: (request) => (
          <>
            <p className="font-medium">
              {request.documentType?.name ?? "Unknown document"}
            </p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {request.purpose ??
                request.documentType?.description ??
                "Document request"}
            </p>
          </>
        ),
      },
      {
        key: "date",
        header: "Date",
        className: "w-[10%] whitespace-normal text-sm",
        cell: (request) =>
          request.createdAt
            ? new Date(request.createdAt).toLocaleDateString("en-US")
            : "—",
      },
      {
        key: "status",
        header: "Status",
        className: "w-[12%] whitespace-normal",
        cell: (request) => (
          <Badge
            variant="outline"
            className={`capitalize ${statusStyles[request.status] ?? ""}`}
          >
            {REQUEST_STATUS_OPTIONS.find((status) => status.id === request.status)
              ?.label ?? request.status}
          </Badge>
        ),
      },
      {
        key: "routing",
        header: "Routing",
        className: "w-[11%] whitespace-normal",
        cell: (request) => {
          const windowId = requestWindowsById[String(request.id)];
          const requestWindow = REQUEST_WINDOWS.find(
            (item) => item.id === windowId,
          );
          return (
            <div className="flex items-center gap-1.5 break-words text-sm text-muted-foreground">
              <span
                aria-label={
                  windowId
                    ? `Window ${windowId.split("-")[1]}`
                    : "College window unassigned"
                }
                className="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/70 text-xs font-semibold leading-none text-muted-foreground"
              >
                {windowId?.split("-")[1] ?? "—"}
              </span>
              {requestWindow?.label.split(" (")[0] ?? "Unassigned"}
            </div>
          );
        },
      },
      {
        key: "action",
        header: "Action",
        className: "w-[15%] whitespace-normal text-right",
        headerClassName: "text-right",
        cell: (request) => {
          const id = String(request.id);
          const requester = request.user?.fullName ?? "Unknown";
          return (
            <div className="flex w-full justify-end">
              <Button
                variant="outline"
                size="sm"
                aria-label={`Review details for ${requester}`}
                className="h-auto min-w-0 gap-1 px-1.5 py-1.5 text-xs whitespace-normal"
                onClick={() => handleReview(id)}
              >
                <Eye className="size-4" aria-hidden="true" />
                <span>Review Details</span>
              </Button>
            </div>
          );
        },
      },
    ],
    [
      allPageRowsSelected,
      handleReview,
      handleSelectChange,
      handleToggleAll,
      requestWindowsById,
      selectedIds,
      somePageRowsSelected,
    ],
  );

  return (
    <DataTable
      columns={columns}
      data={pageRequests}
      keyExtractor={(request) => request.id}
      loading={loading}
      error={error}
      tableClassName="table-fixed"
      emptyMessage={
        departmentRequests.length === 0
          ? `No requests are currently assigned to ${collegeDescription}.`
          : "No requests match these filters."
      }
      pagination={{
        page: safePage,
        totalPages: pageCount,
        totalItems: filteredRequests.length,
        itemsPerPage: WINDOW_REQUEST_PAGE_SIZE,
        itemLabel: `${collegeTitle} requests`,
        onPageChange: setCurrentPage,
      }}
    />
  );
}
