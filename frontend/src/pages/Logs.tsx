import LogsHeader from "@/components/logs/LogsHeader";
import LogsSearchToolbar from "@/components/logs/LogsSearchToolbar";
import LogsTable from "@/components/logs/LogsTable";
import AccountLogsDialog from "@/components/logs/AccountLogsDialog";
import { LogsProvider } from "@/provider/LogsProvider";

function Logs() {
  return (
    <LogsProvider>
      <div className="h-full overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-full flex flex-col gap-4">
          <LogsHeader />
          <LogsSearchToolbar />
          <LogsTable />
          <AccountLogsDialog />
        </div>
      </div>
    </LogsProvider>
  );
}

export default Logs;