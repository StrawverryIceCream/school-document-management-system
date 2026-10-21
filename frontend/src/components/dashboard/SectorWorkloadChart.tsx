import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { buildSectorWorkloadData } from "@/lib/dashboard";

const chartConfig = {
  activeRequests: {
    label: "Active Queue",
    color: "var(--chart-1)",
  },
  completedRequests: {
    label: "Completed",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function SectorWorkloadChart() {
  const { requests, sector, setSector, error } = useDashboard();

  const data = useMemo(() => buildSectorWorkloadData(requests), [requests]);
  const totalLoad = useMemo(
    () => data.reduce((acc, curr) => acc + curr.totalRequests, 0),
    [data]
  );

  if (error) return null;

  return (
    <Card className="rounded-xl border border-border/60 bg-card shadow-sm">
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-bold">
              Workload by Institutional Sector
            </CardTitle>
            {sector && (
              <Badge
                variant="secondary"
                className="cursor-pointer text-xs hover:bg-muted"
                onClick={() => setSector(undefined)}
              >
                Filtered: {sector} ✕
              </Badge>
            )}
          </div>
          <CardDescription>
            Active queues and completed documents across university sectors
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {totalLoad} Total Sector Requests
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 || totalLoad === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No sector request data recorded yet.
          </p>
        ) : (
          <ChartContainer config={chartConfig} className="max-h-75 w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="sector"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(val) => {
                  const map: Record<string, string> = {
                    OVPAA: "Academic",
                    OVPAF: "Admin/Fin",
                    OVPRE: "Research",
                    OVPPD: "Planning",
                    OP: "President",
                  };
                  return map[val] ?? val;
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(val, name, item) => (
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold">{item.payload.label}</span>
                        <span>
                          {name === "activeRequests" ? "Active" : "Completed"}:{" "}
                          {val}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Revenue: ₱{Number(item.payload.revenue).toLocaleString()}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="activeRequests"
                fill="var(--color-activeRequests)"
                radius={[4, 4, 0, 0]}
                onClick={(entry) => {
                  if (entry && "sector" in entry) {
                    const sec = String(entry.sector);
                    setSector(sector === sec ? undefined : sec);
                  }
                }}
                className="cursor-pointer"
              />
              <Bar
                dataKey="completedRequests"
                fill="var(--color-completedRequests)"
                radius={[4, 4, 0, 0]}
                onClick={(entry) => {
                  if (entry && "sector" in entry) {
                    const sec = String(entry.sector);
                    setSector(sector === sec ? undefined : sec);
                  }
                }}
                className="cursor-pointer"
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
