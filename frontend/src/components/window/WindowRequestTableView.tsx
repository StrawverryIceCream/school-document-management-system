import { useContext, useMemo } from "react";
import { RequestContext } from "@/context/RequestContext";
import type { RequestStatus } from "@/types";
import { useWindowView } from "@/hooks/useWindowView";
import WindowRequestHeader from "@/components/window/WindowRequestHeader";
import WindowRequestFilters from "@/components/window/WindowRequestFilters";
import WindowRequestTable from "@/components/window/WindowRequestTable";

function WindowRequestTableView() {
  const { activeView, clearView, TILES } = useWindowView();
  const requestCtx = useContext(RequestContext);

  if (!requestCtx) {
    throw new Error("WindowRequestTableView must be used within a RequestProvider");
  }

  const { filteredRows, loading, error, search, setSearch, statusFilter, setStatusFilter } =
    requestCtx;

  const college = TILES.find((tile) => tile.id === activeView);
  const collegeTitle = college?.title ?? activeView ?? "Window";

  const collegeAliases = useMemo(() => {
    if (!college) return new Set<string>();

    const values = [college.title, college.description];
    const allowed = new Set<string>();

    for (const value of values) {
      if (!value) continue;
      const normalised = value.trim().toLowerCase();
      allowed.add(normalised);
      allowed.add(normalised.replace(/&/g, "and"));
    }

    return allowed;
  }, [college]);

  const visibleRequests = useMemo(() => {
    if (!college) {
      return filteredRows;
    }

    return filteredRows.filter((request) => {
      const requestCollege = (request.college ?? "").trim().toLowerCase();
      const requestWindow = (request.window ?? "").trim().toLowerCase();

      if (!requestCollege && !requestWindow) {
        return true;
      }

      return (
        (requestCollege.length > 0 && collegeAliases.has(requestCollege)) ||
        (requestWindow.length > 0 && collegeAliases.has(requestWindow))
      );
    });
  }, [filteredRows, college, collegeAliases]);

  function handleUpdateStatus(requestId: string, status: RequestStatus) {
    console.warn(`updateRequestStatus not implemented yet: request ${requestId} -> ${status}`);
  }

  return (
    <div style={{ height: "100%", overflow: "hidden", padding: "2.5rem" }}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <WindowRequestHeader collegeTitle={collegeTitle} onBack={clearView} />
        <WindowRequestFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        {loading ? (
          <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
            Loading requests...
          </p>
        ) : error ? (
          <p style={{ fontSize: "0.875rem", color: "var(--destructive, #dc2626)" }}>{error}</p>
        ) : (
          <WindowRequestTable requests={visibleRequests} onUpdateStatus={handleUpdateStatus} />
        )}
      </div>
    </div>
  );
}

export default WindowRequestTableView;