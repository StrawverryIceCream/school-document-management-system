import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type StatusFilter } from "@/context/RequestContext";
import { useRequests } from "@/hooks/useRequests";

export type { StatusFilter } from "@/context/RequestContext";

function RequestHeader() {
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
    <div className="mb-6 space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Request</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All Request in the database
          </p>
        </div>
        <Button variant="outline">Export report</Button>
      </div>

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
          label="Window"
          ariaLabel="Filter by window"
          value={windowFilter}
          onChange={setWindowFilter}
          disabled={windowOptions.length === 0}
          options={[
            { value: "all", label: "All windows" },
            ...windowOptions.map((window) => ({ value: window, label: window })),
          ]}
        />
        <FilterSelect
          label="Status"
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
    </div>
  );
}

function FilterSelect({
  label,
  ariaLabel,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  ariaLabel: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </label>
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

export default RequestHeader;
