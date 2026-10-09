import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLogs } from "@/hooks/useLogs";
import type { ActivityLog } from "@/context/LogsContext";

type TypeFilter = "all" | ActivityLog["type"];

const FILTERS: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "request", label: "Request" },
  { value: "payment", label: "Payment" },
  { value: "account", label: "Account" },
  { value: "document", label: "Document" },
];

function LogsSearchToolbar() {
  const { search, setSearch, typeFilter, setTypeFilter } = useLogs();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by code, name or description"
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs
        value={typeFilter}
        onValueChange={(value) => setTypeFilter(value as TypeFilter)}
      >
        <TabsList className="h-10">
          {FILTERS.map((filter) => (
            <TabsTrigger key={filter.value} value={filter.value}>
              {filter.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export default LogsSearchToolbar;