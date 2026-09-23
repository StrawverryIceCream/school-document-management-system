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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useDashboard } from "@/hooks/useDashboard";
import { getMonthKey, monthLabel } from "@/lib/utils";
import type { RequestType } from "@/types";

const chartConfig = {
  cash: {
    label: "Cash",
    color: "var(--chart-1)",
  },
  online: {
    label: "Online",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface MonthlyPaymentCounts {
  monthKey: string; // "2025-09", used for sorting
  month: string; // "Sep 2025", used for display
  cash: number;
  online: number;
}

// Only requests with feeRequired: true carry a paymentMethod, so anything
// without one (free documents) is skipped here — it has no cash/online
// distinction to plot.
function buildMonthlyPaymentData(requests: RequestType[]): MonthlyPaymentCounts[] {
  const counts = new Map<string, MonthlyPaymentCounts>();

  for (const req of requests) {
    if (!req.paymentMethod) continue;

    const date = new Date(req.submittedAt);
    const monthKey = getMonthKey(date);

    const existing = counts.get(monthKey) ?? {
      monthKey,
      month: monthLabel(date),
      cash: 0,
      online: 0,
    };
    existing[req.paymentMethod] += 1;
    counts.set(monthKey, existing);
  }

  return Array.from(counts.values()).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
}

function PaymentMethodChart() {
  const { requests } = useDashboard();
  const data = buildMonthlyPaymentData(requests);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments by method</CardTitle>
        <CardDescription>Cash vs. online payments per month</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No paid requests yet.
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
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="cash"
                stackId="a"
                fill="var(--color-cash)"
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="online"
                stackId="a"
                fill="var(--color-online)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentMethodChart;