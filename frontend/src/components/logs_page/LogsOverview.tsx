import { Card, CardContent } from "@/components/ui/card";
import { useLogs } from "@/hooks/useLogs";
import { formatDate } from "@/lib/logs";
import { Activity, Clock, Users } from "lucide-react";

function LogsOverview() {
  const { stats, error } = useLogs();

  if (error) return null; // no API / fetch failed — show nothing

  const cards = [
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
      {cards.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="py-0">
          <CardContent className="flex items-start justify-between p-5">
            <div>
              <p className="text-sm">{label}</p>
              <p className="mt-2 text-3xl font-bold">{value}</p>
            </div>
            <div className="rounded-md border p-2">
              <Icon className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default LogsOverview;