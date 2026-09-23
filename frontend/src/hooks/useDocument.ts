// hooks/useDocument.ts
import { useState, useEffect, useCallback } from "react";
import { getDocumentById } from "@/api/document";
import type { DocumentType } from "@/types";

interface DocumentState {
  id: string | undefined;
  document: DocumentType | null;
  error: string | null;
}

export function useDocument(id: string | undefined) {
  const [state, setState] = useState<DocumentState>({
    id: undefined,
    document: null,
    error: null,
  });

  const fetchDocument = useCallback((targetId: string, signal: { cancelled: boolean }) => {
    getDocumentById(targetId).then(
      (data) => {
        if (signal.cancelled) return;
        setState({ id: targetId, document: data, error: null });
      },
      (err) => {
        if (signal.cancelled) return;
        setState({
          id: targetId,
          document: null,
          error: err instanceof Error ? err.message : "Failed to load document",
        });
      },
    );
  }, []);

  useEffect(() => {
    if (!id) return; // nothing to fetch, nothing to setState
    const signal = { cancelled: false };
    fetchDocument(id, signal);
    return () => {
      signal.cancelled = true;
    };
  }, [id, fetchDocument]);

  // Derived, not reset via effect: stale data from a previous id
  // is simply not shown, without any setState needed to "clear" it.
  const document = state.id === id ? state.document : null;
  const error = state.id === id ? state.error : null;
  const loading = id !== undefined && state.id !== id;

  const refresh = useCallback(() => {
    if (!id) return;
    fetchDocument(id, { cancelled: false });
  }, [id, fetchDocument]);

  return { document, loading, error, refresh };
}