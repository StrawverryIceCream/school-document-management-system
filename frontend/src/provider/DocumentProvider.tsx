import { getAllDocument } from "@/api/documents";
import { DocumentContext } from "@/context/DocumentContext";
import { useAuth } from "@/hooks/useAuth";
import { useSWRRevalidate } from "@/hooks/useSWRRevalidate";
import type { DocumentType } from "@/types";
import { useCallback, useEffect, useState } from "react";

const DOCUMENTS_PAGE_SIZE = 200;
const FIRST_PAGE = 1;

interface LoadedDocuments {
  data: DocumentType[];
  totalPages: number;
  totalCount: number;
}

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [debounceSearch, setDebounceSearch] = useState(search);
  const [page, setPage] = useState(FIRST_PAGE);
  const [totalPages, setTotalPages] = useState(FIRST_PAGE);
  const [totalCount, setTotalCount] = useState(0);

  const updateSearch: typeof setSearch = (value) => {
    setSearch(value);
    setPage(FIRST_PAGE);
  };
  const updateIsActive: typeof setIsActive = (value) => {
    setIsActive(value);
    setPage(FIRST_PAGE);
  };

  const loadDocuments = useCallback(async (): Promise<LoadedDocuments> => {
    const response = await getAllDocument({
      search: debounceSearch,
      isActive: isActive,
      page,
      limit: DOCUMENTS_PAGE_SIZE,
    });
    return {
      data: response.data,
      totalPages: response.pagination.totalPages,
      totalCount: response.pagination.total,
    };
  }, [debounceSearch, isActive, page]);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounceSearch(search), 250);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) return;

    let cancelled = false;

    loadDocuments()
      .then(({ data, totalPages, totalCount }) => {
        if (cancelled) return;
        setDocuments(data);
        setTotalPages(totalPages);
        setTotalCount(totalCount);
        setError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load documents:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load documents",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, user, loadDocuments]);

  async function refreshDocument() {
    if (authLoading || !user) return;

    setLoading(true);
    try {
      const { data, totalPages, totalCount } = await loadDocuments();
      setDocuments(data);
      setTotalPages(totalPages);
      setTotalCount(totalCount);
      setError(null);
    } catch (error) {
      console.error("Failed to refresh documents:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load documents",
      );
    } finally {
      setLoading(false);
    }
  }

  // Stale-while-revalidate: background refresh on focus or reconnect
  useSWRRevalidate(refreshDocument, { enabled: Boolean(user) });

  return (
    <DocumentContext.Provider
      value={{
        documents: user ? documents : [],
        loading: authLoading || (user ? loading : false),
        error: user ? error : null,
        search,
        setSearch: updateSearch,
        isActive,
        setIsActive: updateIsActive,
        refreshDocument,
        page,
        setPage,
        totalPages: user ? totalPages : FIRST_PAGE,
        totalCount: user ? totalCount : 0,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
