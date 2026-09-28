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

// Matches the backend's MAX_LIMIT; one page can never return more than this
const REQUESTS_PAGE_SIZE = 100;

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

  // Colleges aren't populated yet, so every request shows; status and search are applied client-side
  const visibleRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      if (filter !== "all" && request.status !== filter) return false;
      if (!term) return true;

      return (
        request.user?.fullName.toLowerCase().includes(term) ||
        request.documentType?.name.toLowerCase().includes(term)
      );
    });
  }, [requests, filter, search]);

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
        visibleRequests,
        loading,
        error,
        filter,
        setFilter,
        search,
        setSearch,
        updateRequestStatus,
      }}
    >
      {children}
    </WindowViewContext.Provider>
  );
}