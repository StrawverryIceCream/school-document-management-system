import DashboardHeader from "@/components/dashboard_page/DashboardHeader";
import StatsOverview from "@/components/dashboard_page/StatsOverview";
import RequestSearchToolbar from "@/components/dashboard_page/RequestSearchToolbar";
import RequestsStatusChart from "@/components/dashboard_page/RequestStatusChart";
import WindowsProcessedChart from "@/components/dashboard_page/WindowsProcessedChart";
import PaymentMethodChart from "@/components/dashboard_page/PaymentMethodChart";
import RequestTable from "@/components/dashboard_page/RequestTable";
import WindowCounterLoads from "@/components/dashboard_page/WindowCounterLoads";
import { DashboardProvider } from "@/provider/DashboardProvider";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
        <DashboardHeader />
        <StatsOverview />

        {/* Operational Overview: Status Velocity Chart & Live Window / Payment Breakdown */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Velocity & Status Chart */}
          <div className="lg:col-span-8">
            <RequestsStatusChart />
          </div>

          {/* Side Operational Panel: Live Window Loads & Payment Distribution */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <WindowCounterLoads />
            <PaymentMethodChart />
          </div>
        </div>

        {/* Priority Requests Queue - Full Width for Maximum Workspace */}
        <section aria-label="Requests Queue and Counter Window Distribution" className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <RequestSearchToolbar />
            <RequestTable />
          </div>

          {/* Monthly Windows Processed Analytics below Request Table */}
          <WindowsProcessedChart />
        </section>
      </div>
    </DashboardProvider>
  );
}


