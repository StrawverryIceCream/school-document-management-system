import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RequestSearchToolbar from "@/components/dashboard/RequestSearchToolbar";
import RequestsStatusChart from "@/components/dashboard/RequestStatusChart"; {/* ignore the error, since di mo pa nalalagay yung request status chart*/}
import RequestTable from "@/components/dashboard/RequestTable";
import { DashboardProvider } from "@/provider/DashboardProvider";

function Dashboard() {
  return (
    <DashboardProvider>
      <div className="h-full overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-full flex flex-col gap-4">
          <DashboardHeader />
          <StatsOverview />
          <RequestSearchToolbar />
           {/*put your request status chart here after fix */}
          <RequestTable />
        </div>
      </div>
    </DashboardProvider>
  );
}

export default Dashboard;