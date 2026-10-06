import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogs } from "@/hooks/useLogs";
import type { ActivityLog } from "@/context/LogsContext";

const FILTERS: Array<{ value: "all" | ActivityLog["type"]; label: string }> = [
  { value: "all", label: "All" },
  { value: "request", label: "Request" },
  { value: "payment", label: "Payment" },
  { value: "account", label: "Account" },
  { value: "document", label: "Document" },
];

function LogsSearchToolbar() {
  const { search, setSearch, typeFilter, setTypeFilter } = useLogs();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search by account name or action..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="sm:max-w-xs"
      />
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <Button
            key={filter.value}
            size="sm"
            variant={typeFilter === filter.value ? "default" : "outline"}
            className="h-8 px-3 text-xs"
            onClick={() => setTypeFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default LogsSearchToolbar;