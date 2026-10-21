import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink } from "lucide-react";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import TruncatedText from "@/components/shared/TruncatedText";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { matchesOffice } from "@/lib/sectors/sector-matching";
import type { OfficeConfig } from "@/lib/sectors/sectors-config";
import { getInitials } from "@/lib/profile";
import type { DocumentRequestWithRelations, RequestStatus } from "@/types";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "claimed", label: "Claimed" },
];

const tabs: SearchToolbarTab[] = STATUS_FILTERS.map((s) => ({
  value: s.value,
  label: s.label,
}));

interface OfficeRequestTableProps {
  sectorId: string;
  divisionId: string;
  office: OfficeConfig;
  requests: DocumentRequestWithRelations[];
  loading: boolean;
  error: string | null;
}

export default function OfficeRequestTable({
  sectorId,
  divisionId,
  office,
  requests,
  loading,
  error,
}: OfficeRequestTableProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const officeRequests = useMemo(
    () => requests.filter((req) => matchesOffice(req, office)),
    [requests, office],
  );

  const visibleRequests = useMemo(() => {
    return officeRequests.filter((req) => {
      const matchesFilter =
        filter === "all" || req.status === (filter as RequestStatus);
      if (!matchesFilter) return false;

      if (!search.trim()) return true;
      const term = search.toLowerCase();
      const refMatch = req.referenceNumber?.toLowerCase().includes(term);
      const nameMatch = req.user?.fullName?.toLowerCase().includes(term);
      const docMatch = (
        req.documentType?.name ??
        req.documentTypeName ??
        ""
      )
        .toLowerCase()
        .includes(term);
      return Boolean(refMatch || nameMatch || docMatch);
    });
  }, [officeRequests, filter, search]);

  const columns: DataTableColumn<DocumentRequestWithRelations>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Ref #",
        className: "w-36",
        cell: (req) => (
          <CopyableId
            id={req.id}
            displayValue={req.referenceNumber || `#${req.id.slice(0, 8)}`}
            label={`Copy request #${req.id}`}
          />
        ),
      },
      {
        key: "requester",
        header: "Requester",
        className: "min-w-56 max-w-xs",
        cell: (req) => {
          const fullName = req.user?.fullName ?? "Unknown Requester";
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
                  {req.user?.studentId
                    ? `ID: ${req.user.studentId}`
                    : (req.user?.role ?? "User")}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "document",
        header: "Document Type",
        className: "min-w-48 max-w-xs",
        cell: (req) => (
          <div className="flex min-w-0 flex-col">
            <TruncatedText
              text={req.documentType?.name ?? req.documentTypeName}
              className="font-medium text-foreground max-w-52"
            />
            <TruncatedText
              text={req.purpose ?? "Document request"}
              className="text-xs text-muted-foreground max-w-52"
            />
          </div>
        ),
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
      {
        key: "actions",
        header: "Action",
        className: "w-28 text-right",
        cell: (req) => (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-8"
            onClick={() =>
              navigate(
                `/sectors/${sectorId}/${divisionId}/${office.id}/requests/${req.id}`,
              )
            }
          >
            Review
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [navigate, sectorId, divisionId, office.id],
  );

  const totalPages = Math.max(1, Math.ceil(visibleRequests.length / pageSize));
  const pagedData = visibleRequests.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <section
      aria-label={`${office.code} requests`}
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit gap-2 px-2 text-base"
          onClick={() => navigate(`/sectors/${sectorId}/${divisionId}`)}
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          Back to {office.code} Offices
        </Button>
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-bold tracking-tight">
            {office.code} Requests Queue
          </h2>
          <p className="text-base text-muted-foreground">
            {office.name} &bull; {office.description}
          </p>
        </div>
      </div>

      <SearchToolbar
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder={`Search ${office.code} requests...`}
        ariaLabel={`Search ${office.code} requests`}
        tabs={tabs}
        activeTab={filter}
        onTabChange={(val) => {
          setFilter(val);
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
        emptyMessage={`No requests found for ${office.code}.`}
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
