import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function MyRequestFilters() {
  return (
    <section className="rounded-xl border bg-card p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <Input
            type="search"
            placeholder="Search your requests..."
            className="h-9 w-full"
          />
        </div>

        <div className="w-full md:max-w-[220px]">
          <Select defaultValue="all">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  );
}

export default MyRequestFilters;
