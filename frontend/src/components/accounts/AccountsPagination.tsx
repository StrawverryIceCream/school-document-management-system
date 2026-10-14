import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useUsers } from "@/hooks/useUsers";
import {
  getPageNumbers,
  getShowingRange,
  NEXT_LABEL,
  PAGINATION_ARIA_LABEL,
  PREVIOUS_LABEL,
  SYNCED_LABEL,
} from "@/lib/accounts-pagination";
import { TONES } from "@/lib/tones";
import { cn } from "cn";

export default function AccountsPagination() {
  const { setPage, pagination, loading, error } = useUsers();

  if (error) return null;

  const { from, to } = getShowingRange(pagination);

  return (
    <Card className="gap-3 rounded-2xl rounded-t-none bg-muted/50 px-5 py-3 shadow-none sm:flex-row sm:items-center sm:justify-between">
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {from}-{to} of {pagination.total} accounts
        </span>
        <span
          className={cn("size-1.5 rounded-full", TONES.neutral.dot)}
          aria-hidden="true"
        />
        <span>{SYNCED_LABEL}</span>
      </p>

      <nav
        aria-label={PAGINATION_ARIA_LABEL}
        className="flex flex-wrap items-center gap-2"
      >
        <Button
          variant="outline"
          className="h-9 px-3 text-sm"
          disabled={loading || pagination.page <= 1}
          onClick={() => setPage(pagination.page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {PREVIOUS_LABEL}
        </Button>

        {getPageNumbers(pagination.page, pagination.totalPages).map(
          (pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === pagination.page ? "default" : "ghost"}
              className="size-9 text-sm font-semibold"
              disabled={loading}
              aria-label={`Page ${pageNumber}`}
              aria-current={pageNumber === pagination.page ? "page" : undefined}
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          className="h-9 px-3 text-sm"
          disabled={loading || pagination.page >= pagination.totalPages}
          onClick={() => setPage(pagination.page + 1)}
        >
          {NEXT_LABEL}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </nav>
    </Card>
  );
}
