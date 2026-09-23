import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyRequest } from "@/hooks/useMyRequest";
import type { RequestStatus } from "@/types";

type MyRequestFiltersProps = {
  statusFilterOptions: Array<{ value: "all" | RequestStatus; label: string }>;
};

function MyRequestFilters({ statusFilterOptions }: MyRequestFiltersProps) {
  const { search, setSearch, statusFilter, setStatusFilter } = useMyRequest();

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
        <input
          type="search"
          placeholder="Search by request ID, document, or keyword"
          className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none focus:ring-2"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | RequestStatus)}>
        <TabsList className="h-10">
          {statusFilterOptions.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

export default MyRequestFilters;
