import { useLogs } from "@/hooks/useLogs";
import { formatDate } from "@/lib/utils";
import { Activity, Clock, Users } from "lucide-react";

function LogsOverview() {
  const { stats, loading, error } = useLogs();

  if (error) return null; // no API / fetch failed — show nothing

  const summaryCards = [
    {
      label: "Total Logs",
      value: stats ? stats.total : "—",
      icon: Activity,
    },
    {
      label: "Active Accounts",
      value: stats ? stats.activeAccounts : "—",
      icon: Users,
    },
    {
      label: "Last Activity",
      value: stats?.lastActivityAt ? formatDate(stats.lastActivityAt) : "—",
      icon: Clock,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mb-8">
      {loading
        ? Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-xl border bg-card p-4 shadow-sm h-28 animate-pulse"
            >
              <div className="h-4 w-28 rounded bg-muted" />
              <div className="mt-3 h-9 w-16 rounded bg-muted" />
            </div>
          ))
        : summaryCards.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="relative rounded-xl border bg-card p-4 shadow-sm h-28"
            >
              <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>

              <div className="pr-10 flex flex-col justify-between h-full">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-3xl font-semibold tracking-tight">{value}</p>
              </div>
            </div>
          ))}
    </section>
  );
}

export default LogsOverview;