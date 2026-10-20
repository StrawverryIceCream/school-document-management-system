import LogsHeader from "@/components/logs/LogsHeader";
import LogsOverview from "@/components/logs/LogsOverview";
import LogsSearchToolbar from "@/components/logs/LogsSearchToolbar";
import LogsTable from "@/components/logs/LogsTable";
import { LogsProvider } from "@/provider/LogsProvider";

export default function Logs() {
  return (
    <LogsProvider>
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
        <LogsHeader />
        <LogsOverview />
        <LogsSearchToolbar />
        <div className="flex min-h-0 flex-1 flex-col">
          <LogsTable />
        </div>
      </div>
    </LogsProvider>
  );
}