import { Link } from "react-router-dom";
import { LayoutGrid, ArrowUpRight } from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { getRequestWindowForCollege } from "@/lib/windowRequests";
import { cn } from "@/lib/utils";

const WINDOW_DEFS = [
  { id: 1, key: "window-1", code: "COS", name: "College of Science", barColor: "bg-primary" },
  { id: 2, key: "window-2", code: "COE", name: "College of Engineering", barColor: "bg-rose-500" },
  { id: 3, key: "window-3", code: "CAFA", name: "Arch & Fine Arts", barColor: "bg-sky-500" },
  { id: 4, key: "window-4", code: "CMMS", name: "College of Management", barColor: "bg-primary" },
  { id: 5, key: "window-5", code: "CIT", name: "Information Technology", barColor: "bg-orange-500" },
  { id: 6, key: "window-6", code: "CIE", name: "Industrial Education", barColor: "bg-sky-500" },
];

export default function WindowCounterLoads() {
  const { requests } = useDashboard();

  // Active requests needing processing or claim
  const activeRequests = requests.filter(
    (r) =>
      r.status === "pending" ||
      r.status === "awaiting_payment" ||
      r.status === "processing" ||
      r.status === "ready",
  );

  const windowData = WINDOW_DEFS.map((win) => {
    const matchingRequests = activeRequests.filter((r) => {
      // 1. Check direct window assignment
      if (r.windowId) {
        const norm = r.windowId.toLowerCase().replace(/[^a-z0-9]/g, "");
        if (norm === win.key.replace("-", "") || norm === `window${win.id}`) {
          return true;
        }
      }

      // 2. Map using college identity
      const assignedWindow = getRequestWindowForCollege(r.college ?? r.collegeName);
      if (assignedWindow === win.key) return true;

      // 3. Fallback matching on code or name
      const col = (r.college ?? "").toLowerCase();
      const colName = (r.collegeName ?? "").toLowerCase();
      const winCode = win.code.toLowerCase();
      const winName = win.name.toLowerCase();
      return col === winCode || colName.includes(winName) || col.includes(winCode);
    });

    const count = matchingRequests.length;

    let statusText = "Idle";
    let statusColor = "text-muted-foreground";
    let barBg = "bg-muted";

    if (count >= 8) {
      statusText = "Heavy";
      statusColor = "text-rose-600 dark:text-rose-400 font-bold";
      barBg = "bg-rose-500";
    } else if (count >= 4) {
      statusText = "Active";
      statusColor = "text-emerald-600 dark:text-emerald-400 font-semibold";
      barBg = "bg-emerald-500";
    } else if (count >= 1) {
      statusText = "Normal";
      statusColor = "text-sky-600 dark:text-sky-400 font-medium";
      barBg = win.barColor;
    }

    return {
      ...win,
      count,
      statusText,
      statusColor,
      barBg,
    };
  });

  const totalInQueue = windowData.reduce((acc, w) => acc + w.count, 0);
  const maxLoad = Math.max(10, ...windowData.map((w) => w.count));

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-border/40 pb-3">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Window Counter Loads</h2>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {totalInQueue > 0 ? `${totalInQueue} Active in Queue` : "6 Counters Online"}
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        {windowData.map((win) => {
          const percentage =
            win.count === 0 ? 0 : Math.min(Math.round((win.count / maxLoad) * 100), 100);

          return (
            <div key={win.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">
                  W{win.id}: {win.name}
                </span>
                <span className="text-muted-foreground">
                  {win.count} in queue • <span className={win.statusColor}>{win.statusText}</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", win.barBg)}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-border/40 pt-3">
        <Link
          to="/windows"
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-muted/60 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <span>Manage Windows & Queues</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}

