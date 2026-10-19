import SearchToolbar from "@/components/shared/SearchToolbar";
import { useDocument } from "@/hooks/useDocument";
import { SEARCH_PLACEHOLDER } from "@/lib/document";

export default function DocumentSearchToolbar() {
  const { search, setSearch } = useDocument();

  return (
    <SearchToolbar
      value={search}
      onChange={setSearch}
      placeholder={SEARCH_PLACEHOLDER}
      ariaLabel="Search documents"
    />
  );
}
