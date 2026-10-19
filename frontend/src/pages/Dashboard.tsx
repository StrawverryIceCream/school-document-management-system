import DashboardHeader from "@/components/dashboard_page/DashboardHeader";
import StatsOverview from "@/components/dashboard_page/StatsOverview";
import RequestSearchToolbar from "@/components/dashboard_page/RequestSearchToolbar";
import RequestsStatusChart from "@/components/dashboard_page/RequestStatusChart";
import WindowsProcessedChart from "@/components/dashboard_page/WindowsProcessedChart";
import PaymentMethodChart from "@/components/dashboard_page/PaymentMethodChart";
import RequestTable from "@/components/dashboard_page/RequestTable";
import { DashboardProvider } from "@/provider/DashboardProvider";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
        <DashboardHeader />
        <StatsOverview />
        <div className="flex flex-col gap-4">
          <RequestsStatusChart />
          <div className="grid gap-4 lg:grid-cols-2">
            <PaymentMethodChart />
            <WindowsProcessedChart />
          </div>
        </div>

        <RequestSearchToolbar />
        <RequestTable />
      </div>
    </DashboardProvider>
  );
}
