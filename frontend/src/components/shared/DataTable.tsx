import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DataTablePagination, {
  type DataTablePaginationProps,
} from "@/components/shared/DataTablePagination";
import { cn } from "@/lib/utils";

export type DataTableColumn<T> = {
  key: string;
  header: React.ReactNode;
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  accessor?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
};

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  skeletonRowCount?: number;
  className?: string;
  tableClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T) => void;
  pagination?: Omit<DataTablePaginationProps, "loading">;
  customRow?: (row: T, index: number) => React.ReactNode;
}

export default function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  error = null,
  emptyMessage = "No records found.",
  skeletonRowCount = 5,
  className,
  tableClassName,
  rowClassName,
  onRowClick,
  pagination,
  customRow,
}: DataTableProps<T>) {
  if (error) {
    return (
      <div role="alert" className="flex items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">{error}</p>
      </div>
    );
  }

  const hasPagination = Boolean(pagination);
  const totalColumnCount = columns.length;

  return (
    <div className={cn("flex flex-col", className)}>
      <Card
        className={cn(
          "min-h-0 gap-0 overflow-hidden rounded-2xl py-0 shadow-sm",
          hasPagination && "rounded-b-none border-b-0",
          "**:data-[slot=table-container]:min-h-0 **:data-[slot=table-container]:flex-1 **:data-[slot=table-container]:overflow-y-auto",
        )}
      >
        <Table className={tableClassName}>
          <TableHeader className="sticky top-0 z-10 bg-muted">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
                    column.className,
                    column.headerClassName,
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumnCount}
                  className="py-12 text-center text-base text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const key = keyExtractor(row, index);

                if (customRow) {
                  const rendered = customRow(row, index);
                  if (rendered !== undefined && rendered !== null) {
                    return rendered;
                  }
                }

                const extraRowClass =
                  typeof rowClassName === "function"
                    ? rowClassName(row, index)
                    : rowClassName;

                return (
                  <TableRow
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "align-middle",
                      onRowClick && "cursor-pointer hover:bg-muted/50",
                      extraRowClass,
                    )}
                  >
                    {columns.map((column) => {
                      const content = column.cell
                        ? column.cell(row, index)
                        : column.accessor
                          ? (row[column.accessor] as React.ReactNode)
                          : null;

                      return (
                        <TableCell
                          key={column.key}
                          className={cn(column.className, column.cellClassName)}
                        >
                          {content}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {pagination && (
        <DataTablePagination {...pagination} loading={loading} />
      )}
    </div>
  );
}
