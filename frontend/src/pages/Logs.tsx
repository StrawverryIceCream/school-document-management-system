import LogsHeader from "@/components/logs_page/LogsHeader";
import LogsSearchToolbar from "@/components/logs_page/LogsSearchToolbar";
import LogsTable from "@/components/logs_page/LogsTable";
import { LogsProvider } from "@/provider/LogsProvider";

function Logs() {
  return (
    <LogsProvider>
      <div className="h-full overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-full flex flex-col gap-4">
          <LogsHeader />
          <LogsSearchToolbar />
          <LogsTable />
        </div>
      </div>
    </LogsProvider>
  );
}

export default Logs;
