import { useMemo, useState } from "react";
import { MOCK_REQUESTS } from "@/data/mockRequests";
import { TILES } from "@/components/window/WindowTileGrid";
import { useSearchAndStatusFilter } from "@/hooks/useSearchAndStatusFilter";
import type { RequestStatus } from "@/types/request";
import type { WindowViewId } from "@/types/window";

export type WindowRequestStatusFilter = "all" | RequestStatus;

export function useWindowRequests(collegeId: WindowViewId) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, RequestStatus>>({});

  const collegeTitle = TILES.find((tile) => tile.id === collegeId)?.description ?? collegeId;

  const collegeRequests = useMemo(
    () =>
      MOCK_REQUESTS.filter((request) => request.college === collegeId)
        .map((request) => ({
          ...request,
          status: statusOverrides[request.id] ?? request.status,
        }))
        .sort((a, b) => b.dateRequested.localeCompare(a.dateRequested)),
    [collegeId, statusOverrides]
  );

  const {
    search,
    setSearch,
    statusFilter: filter,
    setStatusFilter: setFilter,
    filtered: visibleRequests,
  } = useSearchAndStatusFilter(collegeRequests, {
    statusOf: (request) => request.status,
    searchableValues: (request) => [
      request.requesterName,
      request.requesterRole,
      request.documentType,
    ],
  });

  function handleStatusChange(id: string, status: RequestStatus) {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  }

  return {
    collegeTitle,
    filter,
    setFilter,
    search,
    setSearch,
    visibleRequests,
    handleStatusChange,
  };
}
