import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllRequests } from "@/api/requests";
import { getAllUsers } from "@/api/users";
import AssignedRequestFilter, {
  type UrgencySort,
} from "@/components/requests/assigned/AssignedRequestFilter";
import AssignedRequestHeader from "@/components/requests/assigned/AssignedRequestHeader";
import AssignedRequestTable from "@/components/requests/assigned/AssignedRequestTable";
import AssignedRequestTriageTabs from "@/components/requests/assigned/AssignedRequestTriageTabs";
import type { RequestRow } from "@/context/DashboardContext";
import { useAuth } from "@/hooks/useAuth";
import { normalizeRequestRow } from "@/lib/requests";
import type { TriageTab } from "@/lib/sectors/__tests__/assigned-request-route.test";
import type { RequestStatus } from "@/types";

export default function AssignedRequests() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencySort, setUrgencySort] = useState<UrgencySort>("deadline");
  const [assigneeFilter, setAssigneeFilter] = useState("me");
  const [currentTab, setCurrentTab] = useState<TriageTab>("all");

  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffUsers, setStaffUsers] = useState<{ id: string; fullName: string }[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(timer);
  }, [search]);

  // Load staff list if admin
  useEffect(() => {
    if (isAdmin) {
      getAllUsers({ role: "staff", limit: 100 })
        .then((res) => {
          setStaffUsers(res.data.map((u) => ({ id: u.id, fullName: u.fullName })));
        })
        .catch((err) => console.error("Could not fetch staff list:", err));
    }
  }, [isAdmin]);

  const fetchAssignedRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllRequests({
        limit: 100,
        assignedTo: assigneeFilter,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== "all" ? (statusFilter as RequestStatus) : undefined,
      });

      const normalized = res.data
        .map((r) => normalizeRequestRow(r))
        .filter((r): r is RequestRow => Boolean(r));

      setRequests(normalized);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load assigned requests:", err);
      setError(err?.message || "Failed to load assigned requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [assigneeFilter, debouncedSearch, statusFilter]);

  useEffect(() => {
    let ignore = false;
    getAllRequests({
      limit: 100,
      assignedTo: assigneeFilter,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter !== "all" ? (statusFilter as RequestStatus) : undefined,
    })
      .then((res) => {
        if (!ignore) {
          const normalized = res.data
            .map((r) => normalizeRequestRow(r))
            .filter((r): r is RequestRow => Boolean(r));
          setRequests(normalized);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          console.error("Failed to load assigned requests:", err);
          setError(err?.message || "Failed to load assigned requests");
          setRequests([]);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [assigneeFilter, debouncedSearch, statusFilter]);

  // Compute triage counts
  const triageCounts = useMemo(() => {
    const counts: Record<TriageTab, number> = {
      all: requests.length,
      action_needed: 0,
      in_production: 0,
      sla_risk: 0,
      ready: 0,
    };

    const nowMs = Date.now();

    for (const req of requests) {
      if (req.status === "pending" || req.status === "awaiting_payment" || req.status === "on_hold") {
        counts.action_needed++;
      } else if (req.status === "processing") {
        counts.in_production++;
      } else if (req.status === "ready") {
        counts.ready++;
      }

      if (req.submittedAt && (req.status === "pending" || req.status === "processing")) {
        const submittedMs = new Date(req.submittedAt).getTime();
        const days = req.processingDays ?? 3;
        const dueMs = submittedMs + days * 24 * 60 * 60 * 1000;
        if (nowMs >= dueMs - 24 * 60 * 60 * 1000) {
          counts.sla_risk++;
        }
      }
    }

    return counts;
  }, [requests]);

  // Filter requests by current triage tab
  const tabFilteredRequests = useMemo(() => {
    const nowMs = Date.now();

    return requests.filter((req) => {
      if (currentTab === "all") return true;

      if (currentTab === "action_needed") {
        return (
          req.status === "pending" ||
          req.status === "awaiting_payment" ||
          req.status === "on_hold"
        );
      }

      if (currentTab === "in_production") {
        return req.status === "processing";
      }

      if (currentTab === "ready") {
        return req.status === "ready";
      }

      if (currentTab === "sla_risk") {
        if (!req.submittedAt || (req.status !== "pending" && req.status !== "processing")) {
          return false;
        }
        const submittedMs = new Date(req.submittedAt).getTime();
        const days = req.processingDays ?? 3;
        const dueMs = submittedMs + days * 24 * 60 * 60 * 1000;
        return nowMs >= dueMs - 24 * 60 * 60 * 1000;
      }

      return true;
    });
  }, [currentTab, requests]);

  // Sort filtered requests
  const sortedRequests = useMemo(() => {
    return [...tabFilteredRequests].sort((a, b) => {
      if (urgencySort === "deadline") {
        const aSubmitted = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bSubmitted = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        const aDue = aSubmitted + (a.processingDays ?? 3) * 24 * 60 * 60 * 1000;
        const bDue = bSubmitted + (b.processingDays ?? 3) * 24 * 60 * 60 * 1000;
        return aDue - bDue; // Closest deadline first
      }

      if (urgencySort === "newest") {
        const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return bDate - aDate;
      }

      if (urgencySort === "oldest") {
        const aDate = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
        const bDate = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
        return aDate - bDate;
      }

      return 0;
    });
  }, [tabFilteredRequests, urgencySort]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
      <AssignedRequestHeader totalCount={requests.length} />

      <AssignedRequestTriageTabs
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        counts={triageCounts}
      />

      <AssignedRequestFilter
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        urgencySort={urgencySort}
        onUrgencySortChange={setUrgencySort}
        isAdmin={Boolean(isAdmin)}
        assigneeFilter={assigneeFilter}
        onAssigneeChange={setAssigneeFilter}
        staffOptions={staffUsers}
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <AssignedRequestTable
          requests={sortedRequests}
          currentUserId={user?.id || ""}
          loading={loading}
          error={error}
          onRefresh={fetchAssignedRequests}
        />
      </div>
    </div>
  );
}
