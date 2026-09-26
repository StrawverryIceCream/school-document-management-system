import { useMemo, useState } from "react";

interface UseSearchAndStatusFilterOptions<T, S extends string> {
  statusOf: (item: T) => S;
  searchableValues: (item: T) => string[];
}

export function useSearchAndStatusFilter<T, S extends string>(
  items: T[],
  { statusOf, searchableValues }: UseSearchAndStatusFilterOptions<T, S>
) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | S>("all");

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesStatus = statusFilter === "all" || statusOf(item) === statusFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        searchableValues(item).some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        );

      return matchesStatus && matchesSearch;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, statusFilter]);

  return { search, setSearch, statusFilter, setStatusFilter, filtered };
}