import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import { useLogs } from "@/hooks/useLogs";
import type { LogType } from "@/context/LogsContext";

const FILTERS: SearchToolbarTab[] = [
  { value: "all", label: "All" },
  { value: "request", label: "Request" },
  { value: "payment", label: "Payment" },
  { value: "account", label: "Account" },
  { value: "document", label: "Document" },
];

export default function LogsSearchToolbar() {
  const { search, setSearch, typeFilter, setTypeFilter } = useLogs();

  return (
    <SearchToolbar
      value={search}
      onChange={setSearch}
      placeholder="Search by ID, account name, or action..."
      ariaLabel="Search activity logs"
      tabs={FILTERS}
      activeTab={typeFilter}
      onTabChange={(value) => setTypeFilter(value as "all" | LogType)}
      tabsAriaLabel="Filter logs by type"
    />
  );
}