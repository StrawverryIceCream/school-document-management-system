import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { useLogs } from "@/hooks/useLogs";
import { formatDate, formatExactTime, getLogTypeMeta } from "@/lib/logs";
import type { LogEntry } from "@/context/LogsContext";

export default function LogsTable() {
  const { logs, loading, error } = useLogs();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const columns: DataTableColumn<LogEntry>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        className: "w-32",
        cell: (log) => (
          <span className="font-mono text-xs text-muted-foreground">
            {log.accountStudentId ?? "—"}
          </span>
        ),
      },
      {
        key: "account",
        header: "Account",
        className: "font-medium",
        accessor: "accountName",
      },
      {
        key: "role",
        header: "Role",
        className: "capitalize text-muted-foreground",
        accessor: "accountRole",
      },
      {
        key: "type",
        header: "Type",
        cell: (log) => {
          const meta = getLogTypeMeta(log.type);
          const Icon = meta.icon;
          return (
            <Badge
              variant="outline"
              className={`capitalize gap-1 ${meta.className}`}
            >
              <Icon className="h-3 w-3" />
              {log.type}
            </Badge>
          );
        },
      },
      {
        key: "action",
        header: "Action",
        cell: (log) => log.message,
      },
      {
        key: "date",
        header: "Date",
        className: "text-right",
        headerClassName: "text-right",
        cell: (log) => (
          <div className="text-right text-sm text-muted-foreground">
            <div>{formatExactTime(log.createdAt)}</div>
            <div className="text-xs">{formatDate(log.createdAt)}</div>
          </div>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil(logs.length / pageSize));
  const pagedData = logs.slice((page - 1) * pageSize, page * pageSize);

  return (
    <DataTable
      columns={columns}
      data={pagedData}
      keyExtractor={(log) => log.id}
      loading={loading}
      error={error}
      emptyMessage="No activity found."
      pagination={{
        page,
        totalPages,
        totalItems: logs.length,
        itemsPerPage: pageSize,
        itemLabel: "logs",
        onPageChange: setPage,
      }}
    />
  );
}