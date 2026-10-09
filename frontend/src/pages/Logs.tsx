import LogsHeader from "@/components/logs_page/LogsHeader";
import LogsNavPage from "@/components/logs_page/LogsNavPage";
import LogsOverview from "@/components/logs_page/LogsOverview";
import LogsSearchToolbar from "@/components/logs_page/LogsSearchToolbar";
import LogsTable from "@/components/logs_page/LogsTable";
import { LogsProvider } from "@/provider/LogsProvider";

function Logs() {
  return (
    <LogsProvider>
      <div className="h-full overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-full flex flex-col">
          <LogsHeader />
          <LogsOverview />
          <LogsSearchToolbar />
          <LogsTable />
          <LogsNavPage />
        </div>
      </div>
    </LogsProvider>
  );
}

export default Logs;