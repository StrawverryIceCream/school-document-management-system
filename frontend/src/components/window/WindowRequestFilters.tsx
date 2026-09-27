import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { StatusFilter } from "@/context/RequestContext";

interface WindowRequestFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
}

function WindowRequestFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: WindowRequestFiltersProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "0.75rem",
        marginBottom: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
        <Search
          style={{
            width: "1rem",
            height: "1rem",
            position: "absolute",
            left: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <input
          placeholder="Search requester or document"
          style={{
            width: "100%",
            borderRadius: "0.5rem",
            border: "1px solid var(--border, #d1d5db)",
            paddingLeft: "2.25rem",
            paddingRight: "0.75rem",
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
            fontSize: "0.875rem",
            outline: "none",
          }}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Tabs value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as StatusFilter)}>
        <TabsList style={{ height: "2.5rem" }}>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="claimed">Claimed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default WindowRequestFilters;