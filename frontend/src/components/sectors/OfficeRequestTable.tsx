import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ExternalLink,
  Loader2,
  UserMinus,
  UserPlus,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { matchesOffice } from "@/lib/sectors/sector-matching";
import { filterOfficeStaff } from "@/lib/sectors/office-staff";
import type { OfficeConfig } from "@/lib/sectors/sectors-config";
import { getInitials } from "@/lib/profile";
import { cn } from "@/lib/utils";
import { getAllUsers } from "@/api/users";
import { assignRequest } from "@/api/requests";
import { toast } from "sonner";
import type { DocumentRequestWithRelations, RequestStatus, User } from "@/types";

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

  const [localRequests, setLocalRequests] = useState<DocumentRequestWithRelations[]>(requests);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    setLocalRequests(requests);
  }, [requests]);

  useEffect(() => {
    getAllUsers({ role: "staff", limit: 100 })
      .then((res) => {
        setStaffList(res.data);
      })
      .catch((err) => console.error("Could not fetch staff:", err));
  }, []);

  const officeStaff = useMemo(
    () => filterOfficeStaff(staffList, office),
    [staffList, office],
  );

  async function handleAssign(requestId: string, staff: User | null) {
    try {
      setAssigningId(requestId);
      await assignRequest(requestId, staff ? staff.id : null);

      setLocalRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? {
                ...r,
                assignedTo: staff ? staff.id : null,
                assignee: staff
                  ? {
                      id: staff.id,
                      fullName: staff.fullName,
                      email: staff.email,
                      role: staff.role,
                      studentId: staff.studentId ?? null,
                      department: staff.department ?? null,
                      office: staff.office ?? null,
                    }
                  : null,
              }
            : r,
        ),
      );

      toast.success(
        staff
          ? `Assigned to ${staff.fullName}`
          : "Request unassigned successfully",
      );
    } catch (err: any) {
      console.error("Failed to assign request:", err);
      toast.error(err?.message || "Failed to update assignment");
    } finally {
      setAssigningId(null);
    }
  }

  const officeRequests = useMemo(
    () => localRequests.filter((req) => matchesOffice(req, office)),
    [localRequests, office],
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
      const docMatch = (req.documentType?.name ?? req.documentTypeName ?? "")
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
        className: "w-32",
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
        className: "w-40",
        cell: (req) => {
          const fullName = req.user?.fullName ?? "Unknown Requester";
          return (
            <div className="flex items-center gap-2">
              <Avatar className="size-7 shrink-0">
                <AvatarFallback className="bg-muted text-[10px] font-semibold text-foreground">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                {req.user ? (
                  <ProfileTrigger userId={req.user.id}>
                    <button
                      type="button"
                      className="truncate text-left font-semibold text-foreground hover:underline text-xs"
                    >
                      <TruncatedText
                        text={fullName}
                        className="font-semibold text-foreground max-w-28 text-xs"
                      />
                    </button>
                  </ProfileTrigger>
                ) : (
                  <TruncatedText
                    text={fullName}
                    className="font-semibold text-foreground max-w-28 text-xs"
                  />
                )}
                <span className="text-[11px] text-muted-foreground truncate max-w-28">
                  {req.user?.studentId
                    ? req.user.studentId
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
        className: "min-w-44 max-w-xs",
        cell: (req) => (
          <div className="flex min-w-0 flex-col">
            <TruncatedText
              text={req.documentType?.name ?? req.documentTypeName}
              className="font-medium text-foreground max-w-56 text-xs sm:text-sm"
            />
            <TruncatedText
              text={req.purpose ?? "Document request"}
              className="text-xs text-muted-foreground max-w-56"
            />
          </div>
        ),
      },
      {
        key: "date",
        header: "Date",
        className: "w-28 text-xs text-muted-foreground",
        cell: (req) => (
          <span className="tabular-nums">
            {req.createdAt
              ? new Date(req.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "w-28",
        cell: (req) => <RequestStatusBadge status={req.status} />,
      },
      {
        key: "assignee",
        header: "Assignee",
        className: "w-44",
        cell: (req) => {
          const isBusy = assigningId === req.id;
          const currentAssignee = req.assignee;

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isBusy}
                  className={cn(
                    "group flex h-8 w-full max-w-40 items-center justify-between rounded-lg border px-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",
                    currentAssignee
                      ? "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/50 text-foreground"
                      : "border-dashed border-border/80 bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                  title={
                    currentAssignee
                      ? `Assigned to ${currentAssignee.fullName}`
                      : "Click to assign staff"
                  }
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    {currentAssignee ? (
                      <>
                        <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] shrink-0">
                          {currentAssignee.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-xs font-medium">
                          {currentAssignee.fullName.split(" ")[0]}
                        </span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="size-3.5 shrink-0 text-muted-foreground/70" />
                        <span className="italic text-xs">Unassigned</span>
                      </>
                    )}
                  </div>
                  {isBusy ? (
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-3 shrink-0 text-muted-foreground/60 transition-transform group-data-[state=open]:rotate-180" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 max-h-60 overflow-y-auto">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Assign Staff
                </div>
                {currentAssignee && (
                  <>
                    <DropdownMenuItem
                      onClick={() => handleAssign(req.id, null)}
                      className="gap-2 text-amber-600 focus:text-amber-700 dark:text-amber-400 text-xs"
                    >
                      <UserMinus className="size-3.5" />
                      <span>Unassign</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {officeStaff.map((staff) => {
                  const isSelected = req.assignedTo === staff.id;
                  return (
                    <DropdownMenuItem
                      key={staff.id}
                      onClick={() => handleAssign(req.id, staff)}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-[10px] shrink-0">
                          {getInitials(staff.fullName)}
                        </div>
                        <span className="truncate">{staff.fullName}</span>
                      </div>
                      {isSelected && (
                        <Check className="size-3.5 text-primary shrink-0 ml-1" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
      {
        key: "actions",
        header: "Action",
        className: "w-24 text-right",
        cell: (req) => (
          <Button
            size="sm"
            variant="outline"
            className="gap-1 text-xs h-7 px-2.5"
            onClick={() =>
              navigate(
                `/sectors/${sectorId}/${divisionId}/${office.id}/requests/${req.id}`,
              )
            }
          >
            Review
            <ExternalLink className="size-3" aria-hidden="true" />
          </Button>
        ),
      },
    ],
    [navigate, sectorId, divisionId, office.id, assigningId, officeStaff],
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
