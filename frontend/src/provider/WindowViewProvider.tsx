// provider/WindowViewProvider.tsx
import { useEffect, useMemo, useState } from "react";
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
} from "@/lib/window-requests";

// Matches the backend's MAX_LIMIT; one page can never return more than this
const REQUESTS_PAGE_SIZE = 100;

function getUserCollege(
  user: DocumentRequestWithRelations["user"],
): string | undefined {
  return (
    (user as unknown as { college?: string | null } | null | undefined)
      ?.college ?? undefined
  );
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

// The first page reports totalPages, so the remaining pages can load in parallel
async function fetchAllRequests(): Promise<DocumentRequestWithRelations[]> {
  const first = await getAllRequests({
    page: 1,
    limit: REQUESTS_PAGE_SIZE,
  });
  const { totalPages } = first.pagination;

  if (totalPages <= 1) return first.data;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      getAllRequests({ page: index + 2, limit: REQUESTS_PAGE_SIZE }),
    ),
  );

  return [...first.data, ...rest.flatMap((page) => page.data)];
}

export function WindowViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [requests, setRequests] = useState<DocumentRequestWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [documentFilter, setDocumentFilter] = useState("all");
  const [windowFilter, setWindowFilter] = useState<RequestWindow>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);

  async function refreshRequests() {
    setLoading(true);
    try {
      const rows = await fetchAllRequests();
      setRequests(rows);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load requests";
      setError(message);
      console.error("Failed to load requests:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function selectView(id: string) {
    setActiveView(id);
  }

  function clearView() {
    setActiveView(null);
  }

  useEffect(() => {
    // Ignore late responses after unmount so we never set state on a dead provider
    let cancelled = false;

    async function loadRequests() {
      try {
        const rows = await fetchAllRequests();
        if (cancelled) return;
        setRequests(rows);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load requests",
        );
        console.error("Failed to load requests:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRequests();

    return () => {
      cancelled = true;
    };
  }, []);

  const departmentRequests = useMemo(() => {
    const selectedCollege = TILES.find((tile) => tile.id === activeView);
    if (!selectedCollege) return [];

    const collegeNames = new Set(
      [
        selectedCollege.id,
        selectedCollege.title,
        selectedCollege.description,
      ].map((name) => name.trim().toLowerCase()),
    );

    return requests.filter((request) => {
      const college = getUserCollege(request.user)?.trim().toLowerCase();
      return college ? collegeNames.has(college) : false;
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

  // Errors propagate so the caller can show a toast (invalid transition, missing release date)
  async function updateRequestStatus(
    id: string,
    status: RequestStatus,
    extra: Omit<UpdateRequestStatusPayload, "status"> = {},
  ) {
    const updated = await apiUpdateRequestStatus(id, { status, ...extra });

    // The response is the bare row, so merge it to keep the loaded user and document type
    setRequests((prev) =>
      prev.map((request) =>
        String(request.id) === id ? { ...request, ...updated } : request,
      ),
    );
  }

  return (
    <WindowViewContext.Provider
      value={{
        TILES,
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
        selectedRequestId,
        setSelectedRequestId,
        guidelinesOpen,
        setGuidelinesOpen,
        updateRequestStatus,
      }}
    >
      {children}
    </WindowViewContext.Provider>
  );
}
