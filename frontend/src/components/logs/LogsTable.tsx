import { useMemo, useState } from "react";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import TruncatedText from "@/components/shared/TruncatedText";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useLogs } from "@/hooks/useLogs";
import { formatDate, formatExactTime, getLogTypeMeta } from "@/lib/logs";
import { getInitials } from "@/lib/profile";
import type { LogEntry } from "@/context/LogsContext";

export default function LogsTable() {
  const { logs, loading, error } = useLogs();
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const columns: DataTableColumn<LogEntry>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Account ID",
        className: "w-36",
        cell: (log) => (
          <CopyableId
            id={log.accountStudentId}
            displayValue={log.accountStudentId ?? undefined}
            label={`Copy ID of ${log.accountName ?? "account"}`}
          />
        ),
      },
      {
        key: "account",
        header: "Account",
        className: "min-w-56 max-w-xs",
        cell: (log) => {
          const name = log.accountName || "System";
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <TruncatedText
                  text={name}
                  className="font-semibold text-foreground max-w-44"
                />
                <span className="text-xs capitalize text-muted-foreground">
                  {log.accountRole || "User"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "type",
        header: "Type",
        className: "w-32",
        cell: (log) => {
          const meta = getLogTypeMeta(log.type);
          const Icon = meta.icon;
          return (
            <Badge
              variant="outline"
              className={`capitalize gap-1.5 font-medium ${meta.className}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {log.type}
            </Badge>
          );
        },
      },
      {
        key: "action",
        header: "Action",
        className: "min-w-64 max-w-md",
        cell: (log) => (
          <TruncatedText
            text={log.message}
            className="text-sm text-foreground max-w-md"
          />
        ),
      },
      {
        key: "date",
        header: "Date",
        className: "w-36 text-right",
        headerClassName: "text-right",
        cell: (log) => (
          <div className="text-right text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{formatExactTime(log.createdAt)}</div>
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