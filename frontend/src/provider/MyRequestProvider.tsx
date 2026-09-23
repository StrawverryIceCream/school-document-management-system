import { MyRequestContext } from "@/context/MyRequestContext";
import type { DocumentRequest, RequestStatus } from "@/types";
import { useMemo, useState } from "react";

export function MyRequestProvider({
  children,
  requests,
}: {
  children: React.ReactNode;
  requests: DocumentRequest[];
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RequestStatus>("all");

  const filteredRequests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    console.log("FILTER SEARCH:", normalizedSearch);

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      const requestIdToken = `REQ-${String(request.id).padStart(3, "0")}`;
      const searchableValues = [
        requestIdToken,
        String(request.id),
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
    ["pending", "processing", "ready"].includes(request.status),
  ).length;
  const readyCount = requests.filter((request) => request.status === "ready").length;

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
      }}
    >
      {children}
    </MyRequestContext.Provider>
  );
}
