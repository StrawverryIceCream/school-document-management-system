import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import AdministrationRequestSummary from "./AdministrationRequestSummary";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import TruncatedText from "@/components/shared/TruncatedText";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StatusFilter } from "@/context/AdministrationViewContext";
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
import { getInitials } from "@/lib/profile";
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
        key: "id",
        header: "ID",
        className: "w-36",
        cell: (req) => (
          <CopyableId
            id={req.id}
            displayValue={`#${req.id}`}
            label={`Copy request #${req.id}`}
          />
        ),
      },
      {
        key: "requester",
        header: "Requester",
        className: "min-w-56 max-w-xs",
        cell: (req) => {
          const fullName = req.user?.fullName ?? UNKNOWN_REQUESTER;
          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                {req.user ? (
                  <ProfileTrigger userId={req.user.id}>
                    <button
                      type="button"
                      className="truncate text-left font-semibold text-foreground hover:underline"
                    >
                      <TruncatedText
                        text={fullName}
                        className="font-semibold text-foreground max-w-44"
                      />
                    </button>
                  </ProfileTrigger>
                ) : (
                  <TruncatedText
                    text={fullName}
                    className="font-semibold text-foreground max-w-44"
                  />
                )}
                <span className="text-xs text-muted-foreground">
                  {req.user?.studentId ? `ID: ${req.user.studentId}` : (req.user?.role ?? UNKNOWN_ROLE)}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "role",
        header: "Role",
        className: "w-28",
        cell: (req) => (
          <Badge
            variant="outline"
            className="border-transparent bg-muted text-muted-foreground font-normal capitalize"
          >
            {req.user?.role ?? UNKNOWN_ROLE}
          </Badge>
        ),
      },
      {
        key: "document",
        header: "Document Type",
        className: "min-w-48 max-w-xs",
        cell: (req) => {
          const docName = req.documentType?.name ?? UNKNOWN_DOCUMENT;
          const purpose = req.purpose ?? "Document request";
          return (
            <div className="flex min-w-0 flex-col">
              <TruncatedText
                text={docName}
                className="font-medium text-foreground max-w-52"
              />
              <TruncatedText
                text={purpose}
                className="text-xs text-muted-foreground max-w-52"
              />
            </div>
          );
        },
      },
      {
        key: "date",
        header: "Date",
        className: "w-32",
        cell: (req) => (
          <span className="text-sm text-muted-foreground">
            {req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("en-US")
              : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "w-32",
        cell: (req) => <RequestStatusBadge status={req.status} />,
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