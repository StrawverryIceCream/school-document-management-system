import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboard } from "@/hooks/useDashboard";
import { getMonthKey, monthLabel } from "@/lib/utils";
import type { RequestRow } from "@/context/DashboardContext"; 

const WINDOWS = [
  { key: "window1", value: "Window 1", label: "Window 1", color: "var(--chart-1)" },
  { key: "window2", value: "Window 2", label: "Window 2", color: "var(--chart-2)" },
  { key: "window3", value: "Window 3", label: "Window 3", color: "#3b82f6" },
];

const chartConfig = Object.fromEntries(
  WINDOWS.map((w) => [w.key, { label: w.label, color: w.color }]),
) satisfies ChartConfig;

interface MonthlyWindowCounts {
  monthKey: string;
  month: string;
  [windowKey: string]: string | number;
}

function buildMonthlyWindowData(requests: RequestRow[]): MonthlyWindowCounts[] { 
  const counts = new Map<string, MonthlyWindowCounts>();

  for (const req of requests) {
    const windowEntry = WINDOWS.find((w) => w.value === req.course);
    if (!windowEntry || !req.submittedAt) continue; 

    const date = new Date(req.submittedAt);
    const monthKey = getMonthKey(date);

    const existing =
      counts.get(monthKey) ??
      ({
        monthKey,
        month: monthLabel(date),
        ...Object.fromEntries(WINDOWS.map((w) => [w.key, 0])),
      } as MonthlyWindowCounts);

    existing[windowEntry.key] = (existing[windowEntry.key] as number) + 1;
    counts.set(monthKey, existing);
  }

  return Array.from(counts.values()).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
}

function WindowsProcessedChart() {
  const { requests } = useDashboard();
  const data = buildMonthlyWindowData(requests);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requests by window</CardTitle>
        <CardDescription>Requests processed per window, per month</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No requests yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig}>
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
              {WINDOWS.map((w) => (
                <Bar key={w.key} dataKey={w.key} fill={`var(--color-${w.key})`} radius={4} />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default WindowsProcessedChart;