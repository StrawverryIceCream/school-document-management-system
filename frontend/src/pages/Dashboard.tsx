import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RequestSearchToolbar from "@/components/dashboard/RequestSearchToolbar";
import RequestsStatusChart from "@/components/dashboard/RequestStatusChart";
import WindowsProcessedChart from "@/components/dashboard/WindowsProcessedChart";
import PaymentMethodChart from "@/components/dashboard/PaymentMethodChart";
import RequestTable from "@/components/dashboard/RequestTable";
import { DashboardProvider } from "@/provider/DashboardProvider";

function Dashboard() {
  return (
    <DashboardProvider>
      <div className="h-full overflow-auto p-6 sm:p-10">
        <div className="h-full space-y-6">
          <DashboardHeader />
          <StatsOverview />
          <div className="flex flex-col gap-6">
            <RequestsStatusChart />
            <div className="grid gap-6 lg:grid-cols-2">
              <PaymentMethodChart />
              <WindowsProcessedChart />
            </div>
          </div>

          <RequestSearchToolbar />
          <RequestTable />
        </div>
      </div>
    </DashboardProvider>
  );
}

export default Dashboard;