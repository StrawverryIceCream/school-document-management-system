export const DEFAULT_MAX_VISIBLE_PAGES = 5;
export const DEFAULT_FIRST_PAGE = 1;

export function getShowingRange(
  page: number,
  limit: number,
  total: number,
): { from: number; to: number } {
  if (total === 0) return { from: 0, to: 0 };
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return { from, to };
}

export function getPageNumbers(
  page: number,
  totalPages: number,
  maxVisible = DEFAULT_MAX_VISIBLE_PAGES,
): number[] {
  const visibleCount = Math.min(maxVisible, totalPages);
  const halfWindow = Math.floor(maxVisible / 2);
  const start = Math.max(
    DEFAULT_FIRST_PAGE,
    Math.min(page - halfWindow, totalPages - visibleCount + 1),
  );

  return Array.from({ length: visibleCount }, (_, index) => start + index);
}
