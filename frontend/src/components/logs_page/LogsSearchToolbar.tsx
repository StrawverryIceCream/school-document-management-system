import { Input } from "@/components/ui/input";
import { useLogs } from "@/hooks/useLogs";

function LogsSearchToolbar() {
  const { search, setSearch } = useLogs();

  return (
    <div className="flex items-center gap-4">
      <Input
        placeholder="Search by name, email, or ID..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1"
      />
    </div>
  );
}

export default LogsSearchToolbar;

