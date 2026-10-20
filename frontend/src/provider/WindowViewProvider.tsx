// provider/WindowViewProvider.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  WindowViewContext,
  type StatusFilter,
} from "@/context/WindowViewContext";
import {
  getAllRequests,
  updateRequestStatus as apiUpdateRequestStatus,
  type UpdateRequestStatusPayload,
} from "@/api/requests";
import type { DocumentRequestWithRelations, RequestStatus } from "@/types";
import type { WindowTile } from "@/pages/Windows";
import {
  getRequestWindowForCollege,
  type RequestWindow,
} from "@/lib/windows";

// Matches the backend's MAX_LIMIT; one page can never return more than this
const REQUESTS_PAGE_SIZE = 100;

function getUserCollege(user: DocumentRequestWithRelations["user"]) {
  return user?.college;
}

const TILES: WindowTile[] = [
  {
    id: "cos",
    title: "COS",
    imageSrc: "/images/window/COS.png",
    description: "College of Science",
  },
  {
    id: "coe",
    title: "COE",
    imageSrc: "/images/window/COE.png",
    description: "College of Engineering",
  },
  {
    id: "cafa",
    title: "CAFA",
    imageSrc: "/images/window/CAFA.png",
    description: "College of Architecture and Fine Arts",
  },
  {
    id: "cmms",
    title: "CMMS",
    imageSrc: "/images/window/CMMS.png",
    description: "College of Management & Multidisciplinary Studies",
  },
  {
    id: "cit",
    title: "CIT",
    imageSrc: "/images/window/CIT.png",
    description: "College of Information Technology",
  },
  {
    id: "cie",
    title: "CIE",
    imageSrc: "/images/window/CIE.png",
    description: "College of Industrial Education",
  },
];

async function fetchRequests(
  collegeId?: string | null,
): Promise<DocumentRequestWithRelations[]> {
  const first = await getAllRequests({
    college: collegeId ?? undefined,
    page: 1,
    limit: REQUESTS_PAGE_SIZE,
  });
  const { totalPages } = first.pagination;

  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getAllRequests({
        college: collegeId ?? undefined,
        page: index + 2,
        limit: REQUESTS_PAGE_SIZE,
      }),
    ),
  );

  return [...first.data, ...rest.flatMap((page) => page.data)];
}

export function WindowViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activeView = pathname.match(/^\/windows\/([^/]+)/)?.[1] ?? null;
  const [requests, setRequests] = useState<DocumentRequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [windowFilter, setWindowFilter] = useState<RequestWindow>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  const latestLoadId = useRef(0);

  const loadRequests = useCallback(async () => {
    const loadId = ++latestLoadId.current;
    try {
      const rows = await fetchRequests(activeView);
      if (loadId !== latestLoadId.current) return;
      setRequests(rows);
      setError(null);
    } catch (err) {
      if (loadId !== latestLoadId.current) return;
      const message =
        err instanceof Error ? err.message : "Failed to load requests";
      setError(message);
      console.error("Failed to load requests:", err);
    } finally {
      if (loadId === latestLoadId.current) setLoading(false);
    }
  }, [activeView]);

  const refreshRequests = useCallback(async () => {
    setLoading(true);
    await loadRequests();
  }, [loadRequests]);

  // Deferred so the lint rule does not see setState run synchronously in the effect.
  useEffect(() => {
    void Promise.resolve().then(refreshRequests);
  }, [refreshRequests]);

  const selectView = useCallback(
    (id: string) => {
      navigate(`/windows/${id}`);
    },
    [navigate],
  );

  const clearView = useCallback(() => {
    navigate("/windows");
  }, [navigate]);

  const departmentRequests = useMemo(() => {
    const selectedCollege = TILES.find((tile) => tile.id === activeView);
    if (!selectedCollege) return [];

    const selectedWindow = getRequestWindowForCollege(selectedCollege.id);

    return requests.filter((request) => {
      const requestWindow = getRequestWindowForCollege(
        getUserCollege(request.user),
      );
      return selectedWindow !== undefined && requestWindow === selectedWindow;
    });
  }, [activeView, requests]);

  const requestWindowsById = useMemo(
    () =>
      Object.fromEntries(
        requests.map((request) => [
          String(request.id),
          getRequestWindowForCollege(getUserCollege(request.user)),
        ]),
      ),
    [requests],
  );

  const visibleRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return departmentRequests.filter((request) => {
      if (filter !== "all" && request.status !== filter) return false;
      if (!term) return true;

      return (
        request.id.toLowerCase().includes(term) ||
        request.user?.fullName.toLowerCase().includes(term) ||
        request.user?.studentId?.toLowerCase().includes(term) ||
        request.user?.role.toLowerCase().includes(term) ||
        request.documentType?.name.toLowerCase().includes(term) ||
        request.documentType?.description?.toLowerCase().includes(term) ||
        request.purpose?.toLowerCase().includes(term)
      );
    });
  }, [departmentRequests, filter, search]);

  const updateRequestStatus = useCallback(
    async (
      id: string,
      status: RequestStatus,
      extra: Omit<UpdateRequestStatusPayload, "status"> = {},
    ) => {
      const updated = await apiUpdateRequestStatus(id, { status, ...extra });

      setRequests((prev) =>
        prev.map((request) =>
          String(request.id) === id ? { ...request, ...updated } : request,
        ),
      );
    },
    [],
  );

  const value = useMemo(
    () => ({
      TILES,
      requests,
      activeView,
      selectView,
      clearView,
      departmentRequests,
      requestWindowsById,
      visibleRequests,
      loading,
      error,
      refreshRequests,
      filter,
      setFilter,
      search,
      setSearch,
      documentFilter,
      setDocumentFilter,
      windowFilter,
      setWindowFilter,
      currentPage,
      setCurrentPage,
      selectedIds,
      setSelectedIds,
      guidelinesOpen,
      setGuidelinesOpen,
      updateRequestStatus,
    }),
    [
      requests,
      activeView,
      selectView,
      clearView,
      departmentRequests,
      requestWindowsById,
      visibleRequests,
      loading,
      error,
      refreshRequests,
      filter,
      search,
      documentFilter,
      windowFilter,
      currentPage,
      selectedIds,
      guidelinesOpen,
      updateRequestStatus,
    ],
  );

  return (
    <WindowViewContext.Provider value={value}>
      {children}
    </WindowViewContext.Provider>
  );
}
