import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import TruncatedText from "@/components/shared/TruncatedText";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import RequestDetailDialog from "@/components/dashboard/RequestDetailDialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDashboard } from "@/hooks/useDashboard";
import { getInitials } from "@/lib/profile";
import { cn } from "@/lib/utils";
import type { RequestRow } from "@/context/DashboardContext";

type PriorityTab = "all" | "action_needed" | "in_production" | "sla_risk" | "ready";

export default function RequestTable() {
  const { requests, loading, error } = useDashboard();
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [priorityTab, setPriorityTab] = useState<PriorityTab>("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function handleViewClick(request: RequestRow) {
    setSelectedRequest(request);
    setDetailOpen(true);
  }

  const tabCounts = useMemo(() => {
    const now = Date.now();
    let actionNeeded = 0;
    let inProduction = 0;
    let slaRisk = 0;
    let ready = 0;

    for (const r of requests) {
      if (r.status === "pending" || (r.status as string) === "awaiting_payment") {
        actionNeeded += 1;
      }
      if (r.status === "processing") {
        inProduction += 1;
      }
      if (r.status === "ready") {
        ready += 1;
      }

      if (
        r.status === "pending" ||
        r.status === "processing" ||
        (r.status as string) === "awaiting_payment"
      ) {
        const submittedTime = r.submittedAt
          ? new Date(r.submittedAt).getTime()
          : now;
        const daysElapsed = (now - submittedTime) / (1000 * 60 * 60 * 24);
        const limitDays = r.processingDays ?? 3;
        if (daysElapsed > limitDays) {
          slaRisk += 1;
        }
      }
    }

    return {
      all: requests.length,
      action_needed: actionNeeded,
      in_production: inProduction,
      sla_risk: slaRisk,
      ready,
    };
  }, [requests]);

  const filteredByTab = useMemo(() => {
    if (priorityTab === "all") return requests;
    const now = Date.now();
    return requests.filter((r) => {
      if (priorityTab === "action_needed") {
        return (
          r.status === "pending" || (r.status as string) === "awaiting_payment"
        );
      }
      if (priorityTab === "in_production") {
        return r.status === "processing";
      }
      if (priorityTab === "ready") {
        return r.status === "ready";
      }
      if (priorityTab === "sla_risk") {
        if (
          r.status === "pending" ||
          r.status === "processing" ||
          (r.status as string) === "awaiting_payment"
        ) {
          const submittedTime = r.submittedAt
            ? new Date(r.submittedAt).getTime()
            : now;
          const daysElapsed = (now - submittedTime) / (1000 * 60 * 60 * 24);
          const limitDays = r.processingDays ?? 3;
          return daysElapsed > limitDays;
        }
        return false;
      }
      return true;
    });
  }, [requests, priorityTab]);

  const columns: DataTableColumn<RequestRow>[] = useMemo(
    () => [
      {
        key: "id",
        header: "Ref / ID",
        className: "w-36",
        cell: (row) => (
          <CopyableId
            id={row.referenceNumber || row.id}
            displayValue={
              row.referenceNumber ? `#${row.referenceNumber}` : `#${row.id}`
            }
            label={`Copy reference #${row.referenceNumber || row.id}`}
          />
        ),
      },
      {
        key: "applicant",
        header: "Applicant",
        className: "min-w-52 max-w-xs",
        cell: (row) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-9 shrink-0">
              <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                {getInitials(row.applicant)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              {row.userId ? (
                <ProfileTrigger userId={row.userId}>
                  <button
                    type="button"
                    className="truncate text-left font-semibold text-foreground hover:underline"
                  >
                    <TruncatedText
                      text={row.applicant}
                      className="font-semibold text-foreground max-w-40"
                    />
                  </button>
                </ProfileTrigger>
              ) : (
                <TruncatedText
                  text={row.applicant}
                  className="font-semibold text-foreground max-w-40"
                />
              )}
              <span className="text-xs text-muted-foreground">
                {row.studentId ? `ID: ${row.studentId}` : row.college ?? "Student"}
              </span>
            </div>
          </div>
        ),
      },
      {
        key: "document",
        header: "Document",
        className: "min-w-48 max-w-xs",
        cell: (row) => (
          <div className="flex flex-col">
            <TruncatedText
              text={row.document}
              className="font-medium text-foreground max-w-52"
            />
            {row.documentTypeCode && (
              <span className="text-[11px] font-mono text-muted-foreground">
                {row.documentTypeCode}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "office",
        header: "Office & Sector",
        className: "w-44",
        cell: (row) => (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Badge
                variant="secondary"
                className="px-1.5 py-0 text-[10px] font-bold tracking-wider"
              >
                {row.officeCode || "OUR"}
              </Badge>
              <span className="truncate text-xs font-medium text-foreground max-w-32">
                {row.officeName || row.officeCode || "Registrar"}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {row.sector || "Academic"}
            </span>
          </div>
        ),
      },
      {
        key: "sla",
        header: "Turnaround / SLA",
        className: "w-36",
        cell: (row) => {
          const limitDays = row.processingDays ?? 3;
          const submittedTime = row.submittedAt
            ? new Date(row.submittedAt).getTime()
            : Date.now();
          const elapsedDays = Math.max(
            0,
            Math.floor((Date.now() - submittedTime) / (1000 * 60 * 60 * 24))
          );
          const isDelayed =
            (row.status === "pending" ||
              row.status === "processing" ||
              (row.status as string) === "awaiting_payment") &&
            elapsedDays > limitDays;

          return (
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-foreground">
                  {limitDays}d SLA
                </span>
                {isDelayed && (
                  <Badge variant="destructive" className="px-1 py-0 text-[10px] font-bold">
                    +{elapsedDays - limitDays}d Late
                  </Badge>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground">
                {row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "—"}
              </span>
            </div>
          );
        },
      },
      {
        key: "payment",
        header: "Fee",
        className: "w-28",
        cell: (row) => {
          const fee = Number(row.amountDue) || 0;
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-foreground">
                {fee > 0 ? `₱${fee.toLocaleString()}` : "Free"}
              </span>
              <span className="text-[11px] capitalize text-muted-foreground">
                {row.paymentMethod ? row.paymentMethod : fee > 0 ? "Pending" : "No fee"}
              </span>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        className: "w-32",
        cell: (row) => <RequestStatusBadge status={row.status} />,
      },
      {
        key: "actions",
        header: "Action",
        className: "w-24 text-right",
        headerClassName: "text-right",
        cell: (row) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 px-2.5 text-xs font-medium hover:bg-muted"
            onClick={() => handleViewClick(row)}
            aria-label={`Inspect request #${row.referenceNumber || row.id}`}
          >
            <Eye className="size-3.5" />
            <span>Inspect</span>
          </Button>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil(filteredByTab.length / pageSize));
  const pagedData = filteredByTab.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-3">
      {/* Priority Triage Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-3">
        {[
          { key: "all" as const, label: "All Requests", count: tabCounts.all },
          {
            key: "action_needed" as const,
            label: "Action Needed",
            count: tabCounts.action_needed,
            badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
          },
          {
            key: "in_production" as const,
            label: "In Production",
            count: tabCounts.in_production,
            badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
          },
          {
            key: "sla_risk" as const,
            label: "SLA At-Risk",
            count: tabCounts.sla_risk,
            badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
          },
          {
            key: "ready" as const,
            label: "Ready for Pickup",
            count: tabCounts.ready,
            badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setPriorityTab(tab.key);
              setPage(1);
            }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
              priorityTab === tab.key
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{tab.label}</span>
            <span
              className={cn(
                "rounded-full px-1.5 py-0.2 text-[10px]",
                priorityTab === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : tab.badgeColor ?? "bg-background text-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={pagedData}
        keyExtractor={(row) => row.id}
        loading={loading}
        error={error}
        emptyMessage="No requests found in this triage queue."
        pagination={{
          page,
          totalPages,
          totalItems: filteredByTab.length,
          itemsPerPage: pageSize,
          itemLabel: "requests",
          onPageChange: setPage,
        }}
      />

      <RequestDetailDialog
        request={selectedRequest}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
