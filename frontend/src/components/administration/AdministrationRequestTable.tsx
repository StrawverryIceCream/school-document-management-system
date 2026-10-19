import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import AdministrationRequestSummary from "./AdministrationRequestSummary";
import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import type { StatusFilter } from "@/context/AdministrationViewContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdministrationView } from "@/hooks/useAdministrationView";
import {
  BACK_LABEL,
  EMPTY_LABEL,
  SEARCH_PLACEHOLDER,
  STATUS_FILTERS,
  UNKNOWN_DOCUMENT,
  UNKNOWN_REQUESTER,
  UNKNOWN_ROLE,
} from "@/lib/administration/administration-request-table";
import { REQUEST_STATUS_CONFIG, statusStyles } from "@/lib/request";
import type { DocumentRequestWithRelations } from "@/types";

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

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const columns: DataTableColumn<DocumentRequestWithRelations>[] = useMemo(
    () => [
      {
        key: "requester",
        header: "Requester",
        cell: (req) => (
          <span className="text-base font-medium">
            {req.user?.fullName ?? UNKNOWN_REQUESTER}
          </span>
        ),
      },
      {
        key: "role",
        header: "Role",
        cell: (req) => (
          <span className="text-base capitalize text-muted-foreground">
            {req.user?.role ?? UNKNOWN_ROLE}
          </span>
        ),
      },
      {
        key: "document",
        header: "Document Type",
        cell: (req) => (
          <span className="text-base">
            {req.documentType?.name ?? UNKNOWN_DOCUMENT}
          </span>
        ),
      },
      {
        key: "date",
        header: "Date",
        cell: (req) => (
          <span className="text-base">
            {req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("en-US")
              : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (req) => {
          const config = REQUEST_STATUS_CONFIG[req.status];
          const Icon = config?.icon;
          return (
            <Badge
              variant="outline"
              className={`gap-1.5 px-3 py-1 text-sm font-medium capitalize ${
                statusStyles[req.status] ?? ""
              }`}
            >
              {Icon && <Icon className="size-3.5" aria-hidden="true" />}
              {config?.label ?? req.status}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  if (!activeUnit) return null;

  const totalPages = Math.max(1, Math.ceil(visibleRequests.length / pageSize));
  const pagedData = visibleRequests.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

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
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder={SEARCH_PLACEHOLDER}
        ariaLabel={SEARCH_PLACEHOLDER}
        tabs={adminTabs}
        activeTab={filter}
        onTabChange={(value) => {
          setFilter(value as StatusFilter);
          setPage(1);
        }}
        tabsAriaLabel="Filter requests by status"
      />

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(req) => req.id}
        loading={loading}
        error={error}
        emptyMessage={EMPTY_LABEL}
        pagination={{
          page,
          totalPages,
          totalItems: visibleRequests.length,
          itemsPerPage: pageSize,
          itemLabel: "requests",
          onPageChange: setPage,
        }}
      />
    </section>
  );
}