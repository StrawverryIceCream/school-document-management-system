import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import { useMyRequest } from "@/hooks/useMyRequest";
import type { RequestStatus } from "@/types";

const statusFilterOptions: SearchToolbarTab[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "claimed", label: "Claimed" },
  { value: "cancelled", label: "Cancelled" },
];

export default function MyRequestFilters() {
  const { search, setSearch, statusFilter, setStatusFilter } = useMyRequest();

  return (
    <SearchToolbar
      value={search}
      onChange={setSearch}
      placeholder="Search by request ID, document, or keyword"
      ariaLabel="Search requests"
      tabs={statusFilterOptions}
      activeTab={statusFilter}
      onTabChange={(value) => setStatusFilter(value as "all" | RequestStatus)}
      tabsAriaLabel="Filter requests by status"
    />
  );
}
