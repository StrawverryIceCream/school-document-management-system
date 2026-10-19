import { useEffect, useMemo, useState } from "react";
import {
  AdministrationViewContext,
  type StatusFilter,
} from "@/context/AdministrationViewContext";
import { getAllRequests } from "@/api/requests";
import {
  ADMINISTRATION_UNITS,
  ADMIN_REQUESTER_ROLES,
  matchesUnit,
} from "@/lib/administration/administration-units";
import type { DocumentRequestWithRelations } from "@/types";

// Matches the backend's MAX_LIMIT; one page can never return more than this
const REQUESTS_PAGE_SIZE = 100;

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

export function AdministrationViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [allRequests, setAllRequests] = useState<
    DocumentRequestWithRelations[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");

  function selectUnit(id: string) {
    setActiveUnitId(id);
  }

  // Reset the table controls so the next unit does not inherit stale filters
  function clearUnit() {
    setActiveUnitId(null);
    setFilter("all");
    setSearch("");
  }

  useEffect(() => {
    // Ignore late responses after unmount so we never set state on a dead provider
    let cancelled = false;

    async function loadRequests() {
      try {
        const rows = await fetchAllRequests();
        if (cancelled) return;
        setAllRequests(rows);
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

  // The list endpoint has no role filter, so faculty and staff are picked out client-side
  const requests = useMemo(
    () =>
      allRequests.filter(
        (request) =>
          request.user !== undefined &&
          ADMIN_REQUESTER_ROLES.includes(request.user.role),
      ),
    [allRequests],
  );

  const activeUnit = useMemo(
    () =>
      ADMINISTRATION_UNITS.find((unit) => unit.id === activeUnitId) ?? null,
    [activeUnitId],
  );

  const visibleRequests = useMemo(() => {
    if (!activeUnit) return [];

    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      if (!matchesUnit(request.user?.department, activeUnit)) return false;
      if (filter !== "all" && request.status !== filter) return false;
      if (!term) return true;

      return (
        request.user?.fullName.toLowerCase().includes(term) ||
        request.documentType?.name.toLowerCase().includes(term)
      );
    });
  }, [requests, activeUnit, filter, search]);

  return (
    <AdministrationViewContext.Provider
      value={{
        activeUnit,
        selectUnit,
        clearUnit,
        requests,
        visibleRequests,
        loading,
        error,
        filter,
        setFilter,
        search,
        setSearch,
      }}
    >
      {children}
    </AdministrationViewContext.Provider>
  );
}