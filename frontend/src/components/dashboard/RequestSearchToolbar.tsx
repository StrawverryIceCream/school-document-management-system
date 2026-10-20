import SearchToolbar from "@/components/shared/SearchToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/hooks/useDashboard";

export default function RequestSearchToolbar() {
  const { search, setSearch, status, setStatus } = useDashboard();

  return (
    <SearchToolbar
      value={search}
      onChange={setSearch}
      placeholder="Search student name or ID..."
      ariaLabel="Search student name or ID"
    >
      <Select
        value={status ?? "all"}
        onValueChange={(v) => setStatus(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-44 shrink-0">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="ready">Ready</SelectItem>
          <SelectItem value="claimed">Claimed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </SearchToolbar>
  );
}