import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPageNumbers, getShowingRange } from "@/lib/shared/table";
import { TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

export interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  loading?: boolean;
  syncLabel?: string;
  className?: string;
  ariaLabel?: string;
}

export default function DataTablePagination({
  page,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  itemLabel = "items",
  onPageChange,
  loading = false,
  syncLabel,
  className,
  ariaLabel = "Table pagination",
}: DataTablePaginationProps) {
  if (totalItems === 0 && totalPages <= 1) return null;

  const { from, to } = getShowingRange(page, itemsPerPage, totalItems);
  const pages = getPageNumbers(page, totalPages);

  return (
    <Card
      className={cn(
        "shrink-0 gap-3 rounded-2xl rounded-t-none bg-muted/50 px-5 py-3 shadow-none sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>
          Showing {from}-{to} of {totalItems} {itemLabel}
        </span>
        {syncLabel && (
          <>
            <span
              className={cn("size-1.5 rounded-full", TONES.neutral.dot)}
              aria-hidden="true"
            />
            <span>{syncLabel}</span>
          </>
        )}
      </p>

      <nav aria-label={ariaLabel} className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          className="h-9 px-3 text-sm"
          disabled={loading || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            variant={pageNumber === page ? "default" : "ghost"}
            className="size-9 text-sm font-semibold"
            disabled={loading}
            aria-label={`Page ${pageNumber}`}
            aria-current={pageNumber === page ? "page" : undefined}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          variant="outline"
          className="h-9 px-3 text-sm"
          disabled={loading || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </nav>
    </Card>
  );
}
