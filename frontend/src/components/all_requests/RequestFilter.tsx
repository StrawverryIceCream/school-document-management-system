import { type StatusFilter } from "@/context/RequestContext";
import { useRequests } from "@/hooks/useRequests";
import { ChevronDown, Search } from "lucide-react";

function RequestFilter() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    windowFilter,
    setWindowFilter,
    windowOptions,
  } = useRequests();

  return (
    <div className="grid items-end gap-4 lg:grid-cols-3">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search applicant, document, or request ID"
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
        />
      </div>

      <FilterSelect
        ariaLabel="Filter by window"
        value={windowFilter}
        onChange={setWindowFilter}
        disabled={windowOptions.length === 0}
        options={[
          { value: "all", label: "All windows" },
          ...windowOptions.map((window) => ({
            value: window,
            label: window,
          })),
        ]}
      />
      <FilterSelect
        ariaLabel="Filter by status"
        value={statusFilter}
        onChange={(value) => setStatusFilter(value as StatusFilter)}
        options={[
          { value: "all", label: "All statuses" },
          { value: "pending", label: "Pending" },
          { value: "processing", label: "Processing" },
          { value: "ready", label: "Ready" },
          { value: "claimed", label: "Claimed" },
          { value: "cancelled", label: "Cancelled" },
        ]}
      />
    </div>
  );
}

function FilterSelect({
  ariaLabel,
  value,
  onChange,
  options,
  disabled = false,
}: {
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="relative">
        <select
          aria-label={ariaLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-2.5 pr-9 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}

export default RequestFilter;
