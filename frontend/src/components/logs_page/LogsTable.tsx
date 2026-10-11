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
import { formatDate, formatExactTime, getLogTypeMeta } from "@/lib/logs";

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
            <TableHead>ID</TableHead>
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
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No activity found.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => {
              const meta = getLogTypeMeta(log.type);
              const Icon = meta.icon;
              return (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.accountStudentId ?? "—"}
                  </TableCell>
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
                    <div>{formatExactTime(log.createdAt)}</div>
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