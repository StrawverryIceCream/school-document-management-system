import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMyRequest } from "@/hooks/useMyRequest";
import type { RequestStatus } from "@/types";

function MyRequestFilters() {
  const { search, setSearch, statusFilter, setStatusFilter } = useMyRequest();

  return (
    <section className="rounded-xl border bg-card p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <Input
            type="search"
            value={search}
            onChange={(event) => {
            console.log("SEARCH:", event.target.value);
            setSearch(event.target.value);
          }}
          />
        </div>

        <div className="w-full md:max-w-[220px]">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "all" | RequestStatus)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="claimed">Claimed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

export default MyRequestFilters;
