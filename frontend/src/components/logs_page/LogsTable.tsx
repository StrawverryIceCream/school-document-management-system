import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useLogs } from "@/hooks/useLogs";
import { formatDate } from "@/lib/utils";
import { FileText, CreditCard, UserCog, FileClock } from "lucide-react";
import type { ActivityLog } from "@/context/LogsContext";

const LOG_TYPE_META: Record<
  ActivityLog["type"],
  { icon: typeof FileText; className: string }
> = {
  request: {
    icon: FileClock,
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  },
  payment: {
    icon: CreditCard,
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  },
  account: {
    icon: UserCog,
    className:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  },
  document: {
    icon: FileText,
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
};

function LogsTable() {
  const { logs, loading, error } = useLogs();

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading logs...</p>;
  }

  if (error) return null; // no API / fetch failed — show nothing

  return (
    <div className="flex-1 overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Account</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Action</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground"
              >
                No activity found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const meta = LOG_TYPE_META[log.type];
              const Icon = meta.icon;
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">
                    {log.accountName}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {log.accountRole}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize gap-1 ${meta.className}`}
                    >
                      <Icon className="h-3 w-3" />
                      {log.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.message}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    <div>{log.createdAt}</div>
                    <div className="text-xs">{formatDate(log.createdAt)}</div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

export default LogsTable;
