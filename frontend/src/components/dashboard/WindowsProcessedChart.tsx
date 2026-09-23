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
import type { RequestType } from "@/types";

// `window` values in the data look like "Window 1" (with a space), but
// shadcn's ChartContainer turns each config key into a CSS variable
// (--color-<key>), and CSS variable names can't contain spaces. So each
// window gets a safe `key` for the chart, separate from its display `value`
// (the actual string stored on each request) and `label` (what's shown to
// the user). If a 4th window gets added later, add it to this list only —
// nothing else in the file needs to change.
const WINDOWS = [
  { key: "window1", value: "Window 1", label: "Window 1", color: "var(--chart-1)" },
  { key: "window2", value: "Window 2", label: "Window 2", color: "var(--chart-2)" },
  { key: "window3", value: "Window 3", label: "Window 3", color: "#3b82f6" },
];

const chartConfig = Object.fromEntries(
  WINDOWS.map((w) => [w.key, { label: w.label, color: w.color }]),
) satisfies ChartConfig;

interface MonthlyWindowCounts {
  monthKey: string; // "2025-09", used for sorting
  month: string; // "Sep 2025", used for display
  [windowKey: string]: string | number;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function buildMonthlyWindowData(requests: RequestType[]): MonthlyWindowCounts[] {
  const counts = new Map<string, MonthlyWindowCounts>();

  for (const req of requests) {
    const windowEntry = WINDOWS.find((w) => w.value === req.window);
    if (!windowEntry) continue; // unknown window value — skip rather than guess

    const date = new Date(req.submittedAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

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
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              {WINDOWS.map((w) => (
                <Bar
                  key={w.key}
                  dataKey={w.key}
                  fill={`var(--color-${w.key})`}
                  radius={4}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default WindowsProcessedChart;