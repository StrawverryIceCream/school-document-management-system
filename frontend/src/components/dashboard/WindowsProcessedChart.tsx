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
import { getMonthKey, monthLabel } from "@/lib/dashboard";
import { getRequestWindowForCollege } from "@/lib/windows";
import type { RequestRow } from "@/context/DashboardContext";

const WINDOWS = [
  { key: "window1", label: "W1: COS", color: "var(--chart-1)" },
  { key: "window2", label: "W2: COE", color: "var(--chart-2)" },
  { key: "window3", label: "W3: CAFA", color: "var(--chart-3)" },
  { key: "window4", label: "W4: CMMS", color: "var(--chart-4)" },
  { key: "window5", label: "W5: CIT", color: "var(--chart-5)" },
  { key: "window6", label: "W6: CIE", color: "#fe932c" },
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
    if (!req.submittedAt) continue;

    const assignedWindow = getRequestWindowForCollege(req.college ?? req.collegeName);
    let matchedKey = assignedWindow ? assignedWindow.replace("-", "") : undefined;

    if (!matchedKey && req.windowId) {
      const norm = req.windowId.toLowerCase().replace(/[^a-z0-9]/g, "");
      const found = WINDOWS.find((w) => w.key === norm);
      if (found) matchedKey = found.key;
    }

    if (!matchedKey) {
      matchedKey = "window1";
    }

    const date = new Date(req.submittedAt);
    const monthKey = getMonthKey(date);

    const existing =
      counts.get(monthKey) ??
      ({
        monthKey,
        month: monthLabel(date),
        ...Object.fromEntries(WINDOWS.map((w) => [w.key, 0])),
      } as MonthlyWindowCounts);

    existing[matchedKey] = ((existing[matchedKey] as number) || 0) + 1;
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
    <Card className="rounded-xl border border-border/60 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Requests by Counter Window</CardTitle>
        <CardDescription>
          Monthly volume processed across all 6 campus college counter windows
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No requests processed yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
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