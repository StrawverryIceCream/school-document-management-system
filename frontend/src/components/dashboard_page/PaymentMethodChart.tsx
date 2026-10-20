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
import { getMonthKey, monthLabel } from "@/lib/dashboard";
import type { RequestRow } from "@/context/DashboardContext"; 

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
  monthKey: string;
  month: string;
  cash: number;
  online: number;
}

function buildMonthlyPaymentData(requests: RequestRow[]): MonthlyPaymentCounts[] { 
  const counts = requests
    .filter((req) => req.paymentMethod && req.submittedAt) 
    .reduce((map, req) => {
      const date = new Date(req.submittedAt!);
      const monthKey = getMonthKey(date);

      const existing = map.get(monthKey) ?? {
        monthKey,
        month: monthLabel(date),
        cash: 0,
        online: 0,
      };
      existing[req.paymentMethod!] += 1;

      return map.set(monthKey, existing);
    }, new Map<string, MonthlyPaymentCounts>());

  return Array.from(counts.values()).sort((a, b) =>
    a.monthKey.localeCompare(b.monthKey),
  );
}

function PaymentMethodChart() {
  const { requests } = useDashboard();
  const data = buildMonthlyPaymentData(requests);

  return (
    <Card className="rounded-xl border border-border/60 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Payments by Method</CardTitle>
        <CardDescription>Cash vs. online payments processed per month</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No paid requests yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="max-h-[300px] w-full">
            <BarChart accessibilityLayer data={data}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="cash" stackId="a" fill="var(--color-cash)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="online" stackId="a" fill="var(--color-online)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentMethodChart;