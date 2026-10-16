import { ArrowLeft, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdministrationView } from "@/hooks/useAdministrationView";
import {
  BACK_LABEL,
  EMPTY_LABEL,
  LOADING_LABEL,
  SEARCH_PLACEHOLDER,
  STATUS_FILTERS,
  TABLE_COLUMNS,
  UNKNOWN_DOCUMENT,
  UNKNOWN_REQUESTER,
  UNKNOWN_ROLE,
} from "@/lib/administration-request-table";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  pending: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  approved: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
  rejected: "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400",
  completed: "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400",
};

export default function AdministrationRequestTable() {
  const {
    activeUnit,
    clearUnit,
    visibleRequests,
    loading,
    error,
    filter,
    setFilter,
    search,
    setSearch,
  } = useAdministrationView();

  if (!activeUnit) return null;

  return (
    <section
      aria-label={`${activeUnit.code} requests`}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-2 px-2 text-base"
          onClick={clearUnit}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          {BACK_LABEL}
        </Button>
        <h1 className="text-4xl font-bold tracking-tight">
          {activeUnit.code} Requests
        </h1>
        <p className="text-base text-muted-foreground">
          All document requests submitted by {activeUnit.name} faculty and
          staff
        </p>
      </div>

      <div
        role="search"
        className="flex flex-col gap-3 lg:flex-row lg:items-center"
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={SEARCH_PLACEHOLDER}
            aria-label={SEARCH_PLACEHOLDER}
            className="h-12 pl-12 text-base"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={filter === option.value ? "default" : "outline"}
              className="h-10 px-4 text-sm"
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {loading && (
        <p className="text-base text-muted-foreground">{LOADING_LABEL}</p>
      )}
      {error && (
        <p role="alert" className="text-base text-destructive">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                {TABLE_COLUMNS.map((column) => (
                  <TableHead key={column} className="h-12 text-sm">
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRequests.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={TABLE_COLUMNS.length}
                    className="h-24 text-center text-base text-muted-foreground"
                  >
                    {EMPTY_LABEL}
                  </TableCell>
                </TableRow>
              ) : (
                visibleRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="text-base font-medium">
                      {request.user?.fullName ?? UNKNOWN_REQUESTER}
                    </TableCell>
                    <TableCell className="text-base capitalize text-muted-foreground">
                      {request.user?.role ?? UNKNOWN_ROLE}
                    </TableCell>
                    <TableCell className="text-base">
                      {request.documentType?.name ?? UNKNOWN_DOCUMENT}
                    </TableCell>
                    <TableCell className="text-base">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-3 py-1 text-sm capitalize",
                          statusStyles[request.status],
                        )}
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}