import { Search } from "lucide-react";

function SearchToolbar() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          placeholder="Search by code, name, description"
          className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2"
        />
      </div>
    </div>
  );
}

export default SearchToolbar;
