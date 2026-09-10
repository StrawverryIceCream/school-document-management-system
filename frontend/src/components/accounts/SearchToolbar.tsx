import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

function SearchToolbar() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          placeholder="Search by name or email"
          className="w-full rounded-lg border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2"
        />
      </div>
      <Tabs defaultValue="All">
        <TabsList className="h-10">
          <TabsTrigger value="All">All</TabsTrigger>
          <TabsTrigger value="Students">Students</TabsTrigger>
          <TabsTrigger value="Teachers">Teachers</TabsTrigger>
          <TabsTrigger value="Staff">Staff</TabsTrigger>
          <TabsTrigger value="Admin">Admin</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default SearchToolbar;
