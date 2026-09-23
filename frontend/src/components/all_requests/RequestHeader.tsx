import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Request overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            All Requests
          </h1>
        </div>
        <Button variant="outline">Export report</Button>
      </div>

      <div className="grid gap-3 xl:grid-cols-2 xl:gap-12">
        <div className="relative w-full xl:mt-6">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search applicant, document, or request ID"
            className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="w-full">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Window
            </label>
            <select
              aria-label="Filter by window"
              value={windowFilter}
              onChange={(event) => setWindowFilter(event.target.value)}
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

      <Tabs value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
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
