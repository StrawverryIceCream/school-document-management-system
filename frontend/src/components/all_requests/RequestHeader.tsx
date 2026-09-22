import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type StatusFilter = "all" | "pending" | "processing" | "ready" | "claimed" | "cancelled";

interface RequestHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  collegeFilter: string;
  onCollegeChange: (value: string) => void;
  windowFilter: string;
  onWindowChange: (value: string) => void;
  collegeOptions: readonly string[];
  windowOptions: string[];
}

function RequestHeader({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  collegeFilter,
  onCollegeChange,
  windowFilter,
  onWindowChange,
  collegeOptions,
  windowOptions,
}: RequestHeaderProps) {
  return (
    <div className="mb-6 space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Request overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            All Requests
          </h1>
        </div>
        <Button variant="outline">Export report</Button>
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search applicant, document, or request ID"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="flex w-full max-w-xl flex-col gap-3 md:flex-row">
          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              College
            </label>
            <select
              aria-label="Filter by college"
              value={collegeFilter}
              onChange={(event) => onCollegeChange(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
            >
              <option value="all">All colleges</option>
              {collegeOptions.map((college) => (
                <option key={college} value={college}>
                  {college}
                </option>
              ))}
            </select>
          </div>

          <div className="min-w-[220px] flex-1">
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Window
            </label>
            <select
              aria-label="Filter by window"
              value={windowFilter}
              onChange={(event) => onWindowChange(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
              disabled={windowOptions.length === 0}
            >
              <option value="all">All windows</option>
              {windowOptions.map((window) => (
                <option key={window} value={window}>
                  {window}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={(value) => onStatusChange(value as StatusFilter)}>
        <TabsList className="h-10">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
          <TabsTrigger value="claimed">Claimed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default RequestHeader;
