import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  MoreVertical,
  UserCheck,
  UserMinus,
} from "lucide-react";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import TruncatedText from "@/components/shared/TruncatedText";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import RequestDetailsDialog from "@/components/requests/all/RequestDetailsDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/profile";
import { findOfficeRoute } from "@/lib/sectors/sectors-config";
import type { RequestRow } from "@/context/DashboardContext";
import { assignRequest as apiAssignRequest } from "@/api/requests";

interface AssignedRequestTableProps {
  requests: RequestRow[];
  currentUserId: string;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export default function AssignedRequestTable({
  requests,
  currentUserId,
  loading,
  error,
  onRefresh,
}: AssignedRequestTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
  const [page, setPage] = useState(1);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const pageSize = 10;

  async function handleAssign(requestId: string, targetId: string | null) {
    try {
      setIsAssigning(requestId);
      await apiAssignRequest(requestId, targetId);
      onRefresh();
    } catch (err) {
      console.error("Failed to update request assignment:", err);
    } finally {
      setIsAssigning(null);
    }
  }

  const columns: DataTableColumn<RequestRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Ref No.",
        className: "w-36",
        cell: (req) => (
          <CopyableId
            id={req.referenceNumber || req.id}
            displayValue={req.referenceNumber || `#${req.id.slice(0, 8)}`}
            label={`Copy reference #${req.referenceNumber || req.id}`}
          />
        ),
      },
      {
        key: "applicant",
        header: "Applicant",
        className: "min-w-48 max-w-xs",
        cell: (req) => (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                {getInitials(req.applicant)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              {req.userId ? (
                <ProfileTrigger userId={req.userId}>
                  <button
                    type="button"
                    className="truncate text-left font-semibold text-foreground hover:underline text-xs sm:text-sm"
                  >
                    <TruncatedText
                      text={req.applicant}
                      className="font-semibold text-foreground max-w-40"
                    />
                  </button>
                </ProfileTrigger>
              ) : (
                <TruncatedText
                  text={req.applicant}
                  className="font-semibold text-foreground max-w-40 text-xs sm:text-sm"
                />
              )}
              <span className="text-[11px] text-muted-foreground truncate">
                {req.college || req.course || "Requester"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "document",
        header: "Document",
        className: "min-w-44 max-w-xs",
        cell: (req) => (
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="size-4 shrink-0 text-muted-foreground" />
            <TruncatedText
              text={req.document}
              className="font-medium text-foreground max-w-48 text-xs sm:text-sm"
            />
          </div>
        ),
      },
      {
        key: "urgency",
        header: "SLA Deadline",
        className: "w-36 text-xs",
        cell: (req) => {
          if (!req.submittedAt) return <span className="text-muted-foreground">—</span>;

          const submittedMs = new Date(req.submittedAt).getTime();
          const days = req.processingDays ?? 3;
          const dueMs = submittedMs + days * 24 * 60 * 60 * 1000;
          const nowMs = Date.now();
          const diffHours = Math.round((dueMs - nowMs) / (1000 * 60 * 60));

          const isComplete = req.status === "ready" || req.status === "claimed" || req.status === "cancelled";
          if (isComplete) {
            return (
              <Badge variant="outline" className="gap-1 py-0 text-[11px] font-normal text-muted-foreground">
                <Clock className="size-3" />
                <span>Resolved</span>
              </Badge>
            );
          }

          if (diffHours < 0) {
            return (
              <Badge variant="destructive" className="gap-1 py-0 text-[11px] font-semibold">
                <AlertCircle className="size-3" />
                <span>Overdue ({Math.abs(diffHours)}h)</span>
              </Badge>
            );
          }

          if (diffHours <= 24) {
            return (
              <Badge
                variant="outline"
                className="gap-1 border-amber-500/40 bg-amber-500/10 py-0 text-[11px] font-semibold text-amber-700 dark:text-amber-400"
              >
                <Clock className="size-3" />
                <span>{diffHours}h left</span>
              </Badge>
            );
          }

          return (
            <span className="text-muted-foreground text-xs tabular-nums">
              {Math.ceil(diffHours / 24)} days left
            </span>
          );
        },
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
        className: "w-36 text-xs",
        cell: (req) => {
          if (req.assignee) {
            return (
              <div className="flex items-center gap-1.5 min-w-0" title={`Assigned to ${req.assignee.fullName}`}>
                <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                  {req.assignee.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="truncate font-medium text-foreground text-xs">
                  {req.assignee.fullName}
                </span>
              </div>
            );
          }
          return (
            <span className="text-muted-foreground/60 italic text-xs">
              Unassigned
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Action",
        className: "w-32 text-right",
        headerClassName: "text-right",
        cell: (req) => {
          const isCollegeDoc =
            req.officeCode === "COL" ||
            req.documentTypeCode?.toUpperCase().startsWith("COL-");

          const route = findOfficeRoute({
            officeCode: req.officeCode,
            officeId: req.officeId,
            officeName: req.officeName,
            sector: req.sector,
            documentTypeCode: req.documentTypeCode,
            college: isCollegeDoc ? req.college : undefined,
          });

          const targetUrl = route ? `${route.url}/requests/${req.id}` : undefined;
          const isAssignedToMe = req.assignedTo === currentUserId;

          return (
            <div className="flex items-center justify-end gap-1">
              {targetUrl ? (
                <Button variant="default" size="sm" asChild className="h-7 gap-1 px-2.5 text-xs font-medium">
                  <Link to={targetUrl}>
                    <ExternalLink className="size-3" />
                    <span>Review</span>
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRequest(req)}
                  className="h-7 gap-1 px-2.5 text-xs"
                >
                  <Eye className="size-3" />
                  <span>View</span>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <MoreVertical className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => setSelectedRequest(req)}>
                    <Eye className="mr-2 size-3.5" />
                    Quick Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAssignedToMe && (
                    <DropdownMenuItem
                      onClick={() => handleAssign(req.id, null)}
                      disabled={isAssigning === req.id}
                      className="text-amber-600 focus:text-amber-700 dark:text-amber-400"
                    >
                      <UserMinus className="mr-2 size-3.5" />
                      Unassign Me
                    </DropdownMenuItem>
                  )}
                  {!req.assignedTo && (
                    <DropdownMenuItem
                      onClick={() => handleAssign(req.id, currentUserId)}
                      disabled={isAssigning === req.id}
                      className="text-emerald-600 focus:text-emerald-700 dark:text-emerald-400"
                    >
                      <UserCheck className="mr-2 size-3.5" />
                      Claim Request
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [currentUserId, isAssigning, onRefresh],
  );

  const totalPages = Math.max(1, Math.ceil(requests.length / pageSize));
  const pagedData = requests.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(req) => req.id}
        error={error}
        emptyMessage={
          loading
            ? "Loading assigned requests..."
            : error
              ? error
              : "No requests found matching this triage filter."
        }
        pagination={{
          page,
          totalPages,
          totalItems: requests.length,
          itemsPerPage: pageSize,
          itemLabel: "assigned requests",
          onPageChange: setPage,
        }}
      />

      <RequestDetailsDialog
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />
    </>
  );
}
