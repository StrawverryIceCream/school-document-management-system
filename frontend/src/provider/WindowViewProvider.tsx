import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  WindowViewContext,
  type StatusFilter,
  type WindowViewRequestStatus,
} from "@/context/WindowViewContext";
import { useRequests } from "@/hooks/useRequests";
import { TILES, type WindowViewId } from "@/pages/Windows";

export function WindowViewProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState<WindowViewId | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [statusOverrides, setStatusOverrides] = useState<Record<string, WindowViewRequestStatus>>({});
  const { requests, loading, error } = useRequests();

  const visibleRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return requests
      .filter((request) => {
        const matchesStatus =
          filter === "all" ||
          (filter === "cancelled" ? request.status === "cancelled" : request.status === filter);

        if (!matchesStatus) {
          return false;
        }

        const haystack = [request.applicant, request.document, request.window ?? ""]
          .join(" ")
          .toLowerCase();

        return normalizedSearch.length === 0 || haystack.includes(normalizedSearch);
      })
      .map((request) => ({
        ...request,
        status: statusOverrides[request.id] ?? request.status,
      }));
  }, [filter, requests, search, statusOverrides]);

  const updateRequestStatus = (
    requestId: string,
    status: WindowViewRequestStatus,
  ) => {
    setStatusOverrides((current) => ({
      ...current,
      [requestId]: status,
    }));
  };

  function selectView(id: WindowViewId) {
    setActiveView(id);
  }

  function clearView() {
    setActiveView(null);
  }

  return (
    <WindowViewContext.Provider
      value={{
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
        TILES,
      }}
    >
      {children}
    </WindowViewContext.Provider>
  );
}