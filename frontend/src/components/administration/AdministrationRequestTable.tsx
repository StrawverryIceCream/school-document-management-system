import { ArrowLeft } from "lucide-react";
import AdministrationRequestSummary from "./AdministrationRequestSummary";
import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import type { StatusFilter } from "@/context/AdministrationViewContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/lib/administration/administration-request-table";
import { cn } from "@/lib/utils";

import { REQUEST_STATUS_CONFIG, statusStyles } from "@/lib/request";

const adminTabs: SearchToolbarTab[] = STATUS_FILTERS.map((item) => ({
  value: item.value,
  label: item.label,
}));

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

      <AdministrationRequestSummary />

      <SearchToolbar
        value={search}
        onChange={setSearch}
        placeholder={SEARCH_PLACEHOLDER}
        ariaLabel={SEARCH_PLACEHOLDER}
        tabs={adminTabs}
        activeTab={filter}
        onTabChange={(value) => setFilter(value as StatusFilter)}
        tabsAriaLabel="Filter requests by status"
      />

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
                      {request.createdAt
                        ? new Date(request.createdAt).toLocaleDateString("en-US")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 px-3 py-1 text-sm font-medium capitalize",
                          statusStyles[request.status],
                        )}
                      >
                        {(() => {
                          const config = REQUEST_STATUS_CONFIG[request.status];
                          const Icon = config?.icon;
                          return (
                            <>
                              {Icon && <Icon className="size-3.5" aria-hidden="true" />}
                              {config?.label ?? request.status}
                            </>
                          );
                        })()}
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