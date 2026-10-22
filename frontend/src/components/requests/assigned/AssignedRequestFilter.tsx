import SearchToolbar from "@/components/shared/SearchToolbar";
import { ChevronDown } from "lucide-react";

export type UrgencySort = "deadline" | "newest" | "oldest";

interface AssignedRequestFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  urgencySort: UrgencySort;
  onUrgencySortChange: (sort: UrgencySort) => void;
  isAdmin: boolean;
  assigneeFilter: string;
  onAssigneeChange: (assignee: string) => void;
  staffOptions?: { id: string; fullName: string }[];
}

export default function AssignedRequestFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  urgencySort,
  onUrgencySortChange,
  isAdmin,
  assigneeFilter,
  onAssigneeChange,
  staffOptions = [],
}: AssignedRequestFilterProps) {
  return (
    <SearchToolbar
      value={search}
      onChange={onSearchChange}
      placeholder="Search applicant, reference number, or document..."
      ariaLabel="Search assigned requests"
    >
      <div className="flex flex-wrap items-center gap-2.5">
        {isAdmin && (
          <FilterSelect
            ariaLabel="Filter by assignee"
            value={assigneeFilter}
            onChange={onAssigneeChange}
            options={[
              { value: "me", label: "Assigned to Me" },
              { value: "all", label: "All Assignees" },
              { value: "unassigned", label: "Unassigned Requests" },
              ...staffOptions.map((s) => ({
                value: s.id,
                label: s.fullName,
              })),
            ]}
          />
        )}

        <FilterSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: "all", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "awaiting_payment", label: "Awaiting Payment" },
            { value: "processing", label: "Processing" },
            { value: "ready", label: "Ready" },
            { value: "claimed", label: "Claimed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />

        <FilterSelect
          ariaLabel="Sort by urgency or date"
          value={urgencySort}
          onChange={(val) => onUrgencySortChange(val as UrgencySort)}
          options={[
            { value: "deadline", label: "Urgent: Nearest Deadline" },
            { value: "newest", label: "Newest Submitted" },
            { value: "oldest", label: "Oldest Submitted" },
          ]}
        />
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
          className="h-10 w-full appearance-none rounded-xl border border-input bg-background px-3.5 pr-8 text-xs font-medium outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/40 sm:text-sm"
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>
    </div>
  );
}
