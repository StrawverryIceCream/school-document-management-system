import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsOverview from "@/components/dashboard/StatsOverview";
import RequestSearchToolbar from "@/components/dashboard/RequestSearchToolbar";
import RequestsStatusChart from "@/components/dashboard/RequestStatusChart";
import SectorWorkloadChart from "@/components/dashboard/SectorWorkloadChart";
import PaymentMethodChart from "@/components/dashboard/PaymentMethodChart";
import WindowCounterLoads from "@/components/dashboard/WindowCounterLoads";
import RequestTable from "@/components/dashboard/RequestTable";
import { DashboardProvider } from "@/provider/DashboardProvider";

export default function Dashboard() {
  return (
    <DashboardProvider>
      <div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6">
        <DashboardHeader />
        <StatsOverview />

        {/* Primary Operational Charts: Velocity Trend & Sector Workload Distribution */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <RequestsStatusChart />
          </div>
          <div className="lg:col-span-5">
            <SectorWorkloadChart />
          </div>
        </div>

        {/* Secondary Analytics: Payment Channels Breakdown & Counter Window Queues */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <PaymentMethodChart />
          </div>
          <div className="lg:col-span-6">
            <WindowCounterLoads />
          </div>
        </div>

        {/* Priority Triage Queue & Search Operations */}
        <section
          aria-label="Operational Requests Triage Queue"
          className="flex flex-col gap-4 rounded-xl border border-border/50 bg-card/50 p-4 shadow-xs"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Operational Requests Triage
              </h2>
              <p className="text-xs text-muted-foreground">
                Live document intake, service SLA turnaround, and action queues
              </p>
            </div>
          </div>
          <RequestSearchToolbar />
          <RequestTable />
        </section>
      </div>
    </DashboardProvider>
  );
}


