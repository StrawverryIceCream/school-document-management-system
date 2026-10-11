import { DocumentContext } from "@/context/DocumentContext";
import { getDocumentById } from "@/api/documents";
import type { DocumentType } from "@/types";
import { useCallback, useContext, useEffect, useState } from "react";

interface DocumentState {
  id: string | undefined;
  document: DocumentType | null;
  error: string | null;
}

export function useDocument(id?: string) {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within DocumentProvider");
  }

  const [state, setState] = useState<DocumentState>({
    id: undefined,
    document: null,
    error: null,
  });

  const fetchDocument = useCallback(
    (targetId: string, signal: { cancelled: boolean }) => {
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
            error:
              err instanceof Error ? err.message : "Failed to load document",
          });
        },
      );
    },
    [],
  );

  useEffect(() => {
    if (!id) return;
    const signal = { cancelled: false };
    fetchDocument(id, signal);
    return () => {
      signal.cancelled = true;
    };
  }, [id, fetchDocument]);

  const document = state.id === id ? state.document : null;
  const documentError = state.id === id ? state.error : null;
  const documentLoading = Boolean(id) && state.id !== id;

  const refreshDocumentById = useCallback(() => {
    if (!id) return;
    fetchDocument(id, { cancelled: false });
  }, [id, fetchDocument]);

  return {
    ...context,
    document,
    documentLoading,
    documentError,
    refreshDocumentById,
  };
}
