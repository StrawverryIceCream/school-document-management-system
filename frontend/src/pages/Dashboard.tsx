import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RequestSearchToolbar from "@/components/dashboard/RequestSearchToolbar";
import RequestsStatusChart from "@/components/dashboard/RequestStatusChart";
import WindowsProcessedChart from "@/components/dashboard/WindowsProcessedChart";
import PaymentMethodChart from "@/components/dashboard/PaymentMethodChart";
import RequestTable from "@/components/dashboard/RequestTable";
import WindowCounterLoads from "@/components/dashboard/WindowCounterLoads";
import { DashboardProvider } from "@/provider/DashboardProvider";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
        <DashboardHeader />
        <StatsOverview />

        {/* Operational Overview: Status Velocity Chart & Live Window Loads */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Velocity & Status Chart */}
          <div className="lg:col-span-8">
            <RequestsStatusChart />
          </div>

          {/* Side Operational Panel: Live Window Loads */}
          <div className="lg:col-span-4">
            <WindowCounterLoads />
          </div>
        </div>

        {/* Priority Requests Queue & Analytics */}
        <section aria-label="Requests Queue and Historical Analytics" className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <RequestSearchToolbar />
            <RequestTable />
          </div>

          {/* Requests by Counter Window */}
          <WindowsProcessedChart />

          {/* Payments by Method Underneath */}
          <PaymentMethodChart />
        </section>
      </div>
    </DashboardProvider>
  );
}


