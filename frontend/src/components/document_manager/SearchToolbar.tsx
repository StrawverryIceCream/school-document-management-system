import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useDocuments } from "@/hooks/useDocuments";

function SearchToolbar() {
  const { setIsActive, setSearch, search } = useDocuments();

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          placeholder="Search by code, name or description"
          className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2"
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
