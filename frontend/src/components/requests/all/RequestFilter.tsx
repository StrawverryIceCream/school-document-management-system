import SearchToolbar from "@/components/shared/SearchToolbar";
import { type StatusFilter } from "@/context/RequestContext";
import { useRequests } from "@/hooks/useRequest";
import { ChevronDown } from "lucide-react";
import { QrScanDialog } from "./QrScanDialog";

function RequestFilter() {
  const {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    documentFilter,
    setDocumentFilter,
    documentOptions,
  } = useRequests();

  return (
    <SearchToolbar
      value={search}
      onChange={setSearch}
      placeholder="Search applicant, document, or request ID"
      ariaLabel="Search requests"
    >
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect
          ariaLabel="Filter by document type"
          value={documentFilter}
          onChange={setDocumentFilter}
          disabled={documentOptions.length === 0}
          options={[
            { value: "all", label: "All documents" },
            ...documentOptions.map((doc) => ({
              value: doc,
              label: doc,
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
            { value: "rejected", label: "Rejected" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
        <QrScanDialog />
      </div>
    </SearchToolbar>
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
    <div className="w-full sm:w-auto">
      <div className="relative">
        <select
          aria-label={ariaLabel}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full sm:w-auto max-w-full sm:max-w-56 appearance-none rounded-xl border border-input bg-background px-4 pr-10 text-base outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40 truncate"
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
