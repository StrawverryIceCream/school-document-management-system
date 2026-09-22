import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useDashboard } from "@/hooks/useDashboard";
import type { RequestType } from "@/types";

// kept as a `type` (not `interface`) on purpose: `keyof Pick<...>` is a
// mapped/utility type and interfaces can't express that in TS.
type ChartField = keyof Pick<
  RequestType,
  "status" | "documentType" | "college" | "paymentStatus"
>;

interface ChartFieldConfig {
  title: string;
  chartType: "bar" | "line";
  groupBy: ChartField | "claimedAtDate";
}

const chartConfigByStatus: Record<string, ChartFieldConfig> = {
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

// Maps each dataKey drawn on the chart to a label/color. ChartContainer reads
// this to expose --color-count as a CSS variable, so the color stays in sync
// with the theme's chart palette instead of a hardcoded hex.
const chartConfig = {
  count: {
    label: "Requests",
    color: "var(--chart-1)",
  },
};

function buildChartData(requests: RequestType[], config: ChartFieldConfig) {
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
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            {config.chartType === "bar" ? (
              <BarChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-count)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            )}
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default RequestsStatusChart;