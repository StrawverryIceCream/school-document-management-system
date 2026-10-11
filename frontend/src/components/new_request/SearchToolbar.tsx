import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDocument } from "@/hooks/useDocument";
import { SEARCH_PLACEHOLDER } from "@/lib/document";

export default function DocumentSearchToolbar() {
  const { search, setSearch } = useDocument();

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div role="search" className="relative w-full">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={SEARCH_PLACEHOLDER}
          aria-label="Search documents"
          className="h-12 rounded-xl border-0 bg-card pl-12 text-base shadow-sm md:text-base"
        />
      </div>
    </div>
  );
}
