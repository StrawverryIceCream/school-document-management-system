import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"; {/* may error cause recharts doesnt exist on the dependencies, modify to use Shadcn components instead, already installed charts*/}
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useDashboard } from "@/hooks/useDashboard";
import type { RequestType } from "@/types";

{/* use int erface, never types*/}
type ChartField = keyof Pick <
  RequestType,
  "status" | "documentType" | "college" | "paymentStatus"
>;

interface ChartConfig {
  title: string;
  chartType: "bar" | "line";
  groupBy: ChartField | "claimedAtDate";
}

const chartConfigByStatus: Record<string, ChartConfig> = {
  all: { title: "Requests by status", chartType: "bar", groupBy: "status" },
  pending: {
    title: "Pending requests by document type",
    chartType: "bar",
    groupBy: "documentType",
  },
  processing: {
    title: "In-process requests by college",
    chartType: "bar",
    groupBy: "college",
  },
  ready: {
    title: "Ready-for-claim requests by document type",
    chartType: "bar",
    groupBy: "documentType",
  },
  claimed: {
    title: "Claimed requests over time",
    chartType: "line",
    groupBy: "claimedAtDate",
  },
  rejected: {
    title: "Rejected requests by college",
    chartType: "bar",
    groupBy: "college",
  },
};

function buildChartData(requests: RequestType[], config: ChartConfig) {
  const counts = new Map<string, number>();

  for (const req of requests) {
    let key: string;

    if (config.groupBy === "claimedAtDate") {
      if (!req.claimedAt) continue;
      key = new Date(req.claimedAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } else {
      key = String(req[config.groupBy] ?? "Unknown");
    }

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
}

function RequestsStatusChart() {
  const { requests, status } = useDashboard();
  const config = chartConfigByStatus[status ?? "all"] ?? chartConfigByStatus.all;

  const data = useMemo(() => buildChartData(requests, config), [requests, config]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No data for this view yet.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            {config.chartType === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#0F6E56" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0F6E56"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}


export default RequestsStatusChart;

