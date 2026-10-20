import { useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWindowView } from "@/hooks/useWindowView";
import { TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { REQUEST_WINDOWS } from "@/lib/windows";
import type { StatusFilter } from "@/context/WindowViewContext";

const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready" },
  { id: "claimed", label: "Claimed" },
  { id: "cancelled", label: "Cancelled" },
];

export function WindowRequestFilters() {
  const {
    departmentRequests,
    requestWindowsById,
    filter,
    setFilter,
    search,
    setSearch,
    documentFilter,
    setDocumentFilter,
    windowFilter,
    setWindowFilter,
    setCurrentPage,
  } = useWindowView();

  const documentTypes = useMemo(
    () =>
      Array.from(
        new Set(
          departmentRequests
            .map((request) => request.documentType?.name)
            .filter((name): name is string => Boolean(name)),
        ),
      ).sort((first, second) => first.localeCompare(second)),
    [departmentRequests],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: 0,
      pending: 0,
      awaiting_payment: 0,
      processing: 0,
      on_hold: 0,
      ready: 0,
      claimed: 0,
      rejected: 0,
      cancelled: 0,
    };
    departmentRequests.forEach((request) => {
      const matchesDocument =
        documentFilter === "all" ||
        request.documentType?.name === documentFilter;
      const matchesWindow =
        windowFilter === "all" ||
        requestWindowsById[String(request.id)] === windowFilter;
      if (matchesDocument && matchesWindow) counts[request.status] += 1;
    });
    counts.all = Object.entries(counts)
      .filter(([status]) => status !== "all")
      .map(([, count]) => count)
      .reduce((total, count) => total + count, 0);
    return counts;
  }, [departmentRequests, documentFilter, requestWindowsById, windowFilter]);

  return (
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="grid items-end gap-4 lg:grid-cols-3">
        <div className="relative min-w-0 flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            role="searchbox"
            aria-label="Search requests"
            placeholder="Search requester, document type, student ID, or tracking code..."
            className="h-10 rounded-lg pl-9 pr-12"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-muted px-1.5 py-0.5 text-sm text-muted-foreground">
            ⌘K
          </kbd>
        </div>
        <Select
          value={documentFilter}
          onValueChange={(value) => {
            setDocumentFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-lg">
            <SelectValue placeholder="All Document Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Document Types</SelectItem>
            {documentTypes.map((documentType) => (
              <SelectItem key={documentType} value={documentType}>
                {documentType}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={windowFilter}
          onValueChange={(value) => {
            const selectedWindow = REQUEST_WINDOWS.find(
              (window) => window.id === value,
            );
            if (selectedWindow) {
              setWindowFilter(selectedWindow.id);
              setCurrentPage(1);
            }
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-lg">
            <SelectValue placeholder="All Windows" />
          </SelectTrigger>
          <SelectContent>
            {REQUEST_WINDOWS.map((window) => (
              <SelectItem key={window.id} value={window.id}>
                {window.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2" aria-label="Filter by status">
        {STATUS_FILTERS.map(({ id, label }) => (
          <Button
            key={id}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={filter === id}
            onClick={() => {
              setFilter(id);
              setCurrentPage(1);
            }}
            className={cn(
              "h-7 rounded-full px-3 text-sm font-medium",
              filter === id && id === "all"
                ? "bg-neutral-950 text-white hover:bg-neutral-800 hover:text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
                : id === "pending" && statusCounts.pending > 0
                  ? cn(TONES.amber.badge, "hover:opacity-90")
                  : filter === id
                    ? "bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              filter === id &&
                id !== "all" &&
                id !== "pending" &&
                "ring-1 ring-foreground/40",
            )}
          >
            {label}
            <span className="ml-1 font-semibold">{statusCounts[id]}</span>
          </Button>
        ))}
      </div>
    </section>
  );
}
