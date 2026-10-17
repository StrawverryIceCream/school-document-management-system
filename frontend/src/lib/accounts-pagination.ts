import type { UsersPagination } from "@/context/UsersContext";

export const PAGINATION_ARIA_LABEL = "Accounts pagination";
export const PREVIOUS_LABEL = "Previous";
export const NEXT_LABEL = "Next";
export const SYNCED_LABEL = "All systems synced";

const MAX_VISIBLE_PAGES = 5;
const FIRST_PAGE = 1;

export function getShowingRange(pagination: UsersPagination): {
  from: number;
  to: number;
} {
  if (pagination.total === 0) return { from: 0, to: 0 };

  const from = (pagination.page - 1) * pagination.limit + 1;
  const to = Math.min(pagination.page * pagination.limit, pagination.total);
  return { from, to };
}

// Keeps the current page inside a sliding window so large registries don't render every page button
export function getPageNumbers(page: number, totalPages: number): number[] {
  const visibleCount = Math.min(MAX_VISIBLE_PAGES, totalPages);
  const halfWindow = Math.floor(MAX_VISIBLE_PAGES / 2);
  const start = Math.max(
    FIRST_PAGE,
    Math.min(page - halfWindow, totalPages - visibleCount + 1),
  );

  return Array.from({ length: visibleCount }, (_, index) => start + index);
}