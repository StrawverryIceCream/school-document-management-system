import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/hooks/useDashboard";
import { getDateKey } from "@/lib/utils";
import type { RequestRow } from "@/context/DashboardContext";   

const chartConfig = {
  submitted: {
    label: "Submitted",
    color: "var(--chart-1)",
  },
  claimed: {
    label: "Claimed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface DailyCounts {
  date: string;
  submitted: number;
  claimed: number;
}

function buildDailyCounts(requests: RequestRow[]): DailyCounts[] { 
  const counts = new Map<string, DailyCounts>();

  const bump = (dateKey: string, field: "submitted" | "claimed") => {
    const existing = counts.get(dateKey) ?? {
      date: dateKey,
      submitted: 0,
      claimed: 0,
    };
    existing[field] += 1;
    counts.set(dateKey, existing);
  };

  for (const req of requests) {
    if (req.submittedAt) bump(getDateKey(req.submittedAt), "submitted");
    if (req.claimedAt) bump(getDateKey(req.claimedAt), "claimed");
  }

  return Array.from(counts.values()).sort((a, b) => a.date.localeCompare(b.date));
}

function RequestsStatusChart() {
  const { requests, timeRange, setTimeRange, error } = useDashboard(); 

  const dailyCounts = useMemo(() => buildDailyCounts(requests), [requests]);

  const filteredData = useMemo(() => {
    if (dailyCounts.length === 0) return [];

    const referenceDate = new Date(dailyCounts[dailyCounts.length - 1].date);

    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return dailyCounts.filter((item) => new Date(item.date) >= startDate);
  }, [dailyCounts, timeRange]);

  if (error) return null; // 👈 added

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Requests over time</CardTitle>
          <CardDescription>
            Submitted vs. claimed requests for the selected period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">Last 3 months</SelectItem>
            <SelectItem value="30d" className="rounded-lg">Last 30 days</SelectItem>
            <SelectItem value="7d" className="rounded-lg">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No data for this period yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillSubmitted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-submitted)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-submitted)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillClaimed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-claimed)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-claimed)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area dataKey="claimed" type="natural" fill="url(#fillClaimed)" stroke="var(--color-claimed)" stackId="a" />
              <Area dataKey="submitted" type="natural" fill="url(#fillSubmitted)" stroke="var(--color-submitted)" stackId="a" />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default RequestsStatusChart;