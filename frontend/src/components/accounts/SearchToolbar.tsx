import { Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { useUsers } from "@/hooks/useUsers";

function SearchToolbar() {
  const { setRole, setSearch, search } = useUsers();

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search by name, email or student Id"
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring/40"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Tabs defaultValue="All">
        <TabsList className="h-10">
          <TabsTrigger onClick={() => {setRole("")}} value="All">All</TabsTrigger>
          <TabsTrigger onClick={() => {setRole("student")}} value="Students">Students</TabsTrigger>
          <TabsTrigger onClick={() => {setRole("teacher")}} value="Teachers">Teachers</TabsTrigger>
          <TabsTrigger onClick={() => {setRole("staff")}} value="Staff">Staff</TabsTrigger>
          <TabsTrigger onClick={() => {setRole("admin")}} value="Admin">Admin</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

export default SearchToolbar;
