import { useEffect, useMemo, useState } from "react";
import {
  WindowViewContext,
  type RequestDocumentType,
  type RequestUser,
  type StatusFilter,
} from "@/context/WindowViewContext";
import { getAllRequests } from "@/api/requests";
import { getUserById } from "@/api/user";
import { getDocumentById } from "@/api/document";
import type { DocumentRequest } from "@/types";

// One failed lookup (e.g. a deleted user) must not blank the whole table
async function loadLookup<T>(
  ids: number[],
  fetchById: (id: number) => Promise<T>,
): Promise<Map<number, T>> {
  const settled = await Promise.allSettled(ids.map((id) => fetchById(id)));
  const lookup = new Map<number, T>();

  settled.forEach((result, index) => {
    if (result.status === "fulfilled") {
      lookup.set(ids[index], result.value);
    } else {
      console.error(`Lookup failed for id ${ids[index]}:`, result.reason);
    }
  });

  return lookup;
}

export function WindowViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeView, setActiveView] = useState<string | null>(null);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [usersById, setUsersById] = useState<Map<number, RequestUser>>(
    new Map(),
  );
  const [documentTypesById, setDocumentTypesById] = useState<
    Map<number, RequestDocumentType>
  >(new Map());
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
        const response = await getAllRequests();
        const rows = response.data;

        // Dedupe ids so each user and document type is fetched once, not once per request
        const userIds = Array.from(new Set(rows.map((row) => row.userId)));
        const documentTypeIds = Array.from(
          new Set(rows.map((row) => row.documentTypeId)),
        );

        const [users, documentTypes] = await Promise.all([
          loadLookup<RequestUser>(userIds, getUserById),
          loadLookup<RequestDocumentType>(documentTypeIds, getDocumentById),
        ]);

        if (cancelled) return;

        setRequests(rows);
        setUsersById(users);
        setDocumentTypesById(documentTypes);
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

  // The API has no college filter yet, so status and search are applied client-side
  const visibleRequests = useMemo(() => {
    const term = search.trim().toLowerCase();

    return requests.filter((request) => {
      if (filter !== "all" && request.status !== filter) return false;
      if (!term) return true;

      const requester = (
        usersById.get(request.userId)?.fullName ?? ""
      ).toLowerCase();
      const document = (
        documentTypesById.get(request.documentTypeId)?.name ?? ""
      ).toLowerCase();
      return requester.includes(term) || document.includes(term);
    });
  }, [requests, usersById, documentTypesById, filter, search]);

  // No update endpoint exists yet, so this only changes local state and resets on reload
  function updateRequestStatus(id: number, status: DocumentRequest["status"]) {
    setRequests((prev) =>
      prev.map((request) =>
        request.id === id ? { ...request, status } : request,
      ),
    );
  }

  return (
    <WindowViewContext.Provider
      value={{
        activeView,
        selectView,
        clearView,
        visibleRequests,
        usersById,
        documentTypesById,
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