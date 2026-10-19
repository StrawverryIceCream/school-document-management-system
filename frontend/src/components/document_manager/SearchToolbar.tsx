import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocument } from "@/hooks/useDocument";

function SearchToolbar() {
  const { setIsActive, setSearch, search } = useDocument();

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by code, name or description"
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Tabs defaultValue="All">
        <TabsList className="h-10">
          <TabsTrigger onClick={() => setIsActive(undefined)} value="All">
            All
          </TabsTrigger>
          <TabsTrigger onClick={() => setIsActive(true)} value="Active">
            Active
          </TabsTrigger>
          <TabsTrigger onClick={() => setIsActive(false)} value="Inactive">
            Inactive
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default SearchToolbar;
