import {
  MyRequestContext,
  type MyRequestWithDocumentName,
} from "@/context/MyRequestContext";
import { getMyRequests } from "@/api/requests";
import { getAllDocument } from "@/api/documents";
import type { RequestStatus } from "@/types";
import { useEffect, useMemo, useState } from "react";


const MY_REQUESTS_FETCH_LIMIT = 200;
const DOCUMENT_TYPES_FETCH_LIMIT = 100;

const UNKNOWN_DOCUMENT_NAME = "Unknown document";

const ACTIVE_STATUSES: RequestStatus[] = ["pending", "processing", "ready"];

export function MyRequestProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<MyRequestWithDocumentName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>(
    "all",
  );

  useEffect(() => {
    let isMounted = true;

    async function loadMyRequests() {
      setLoading(true);
      setError(null);
      try {
        const [requestsRes, documentsRes] = await Promise.all([
          getMyRequests({ limit: MY_REQUESTS_FETCH_LIMIT }),
          getAllDocument({ limit: DOCUMENT_TYPES_FETCH_LIMIT }),
        ]);

        const documentNameById = new Map(
          documentsRes.data.map((document) => [
            String(document.id),
            document.name,
          ]),
        );

        const enrichedRequests = requestsRes.data.map((request) => ({
          ...request,
          documentName:
            documentNameById.get(String(request.documentTypeId)) ??
            UNKNOWN_DOCUMENT_NAME,
        }));

        if (isMounted) setRequests(enrichedRequests);
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load your requests",
          );
          console.error("Failed to load my requests:", err);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadMyRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const requestIdToken = `REQ-${String(request.id).padStart(3, "0")}`;
      const searchableValues = [
        requestIdToken,
        String(request.id),
        request.documentName,
        ...(request.tags ?? []).map((tag) => String(tag).trim()),
      ];

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableValues.some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, statusFilter]);

  const totalCount = requests.length;
  const activeCount = requests.filter((request) =>
    ACTIVE_STATUSES.includes(request.status),
  ).length;
  const readyCount = requests.filter(
    (request) => request.status === "ready",
  ).length;

  return (
    <MyRequestContext.Provider
      value={{
        requests,
        filteredRequests,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        totalCount,
        activeCount,
        readyCount,
        loading,
        error,
      }}
    >
      {children}
    </MyRequestContext.Provider>
  );
}
