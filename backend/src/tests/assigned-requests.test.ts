import assert from "node:assert";

// Unit tests for assigned requests filtering and triage categorization logic

interface MockAssignee {
  id: string;
  fullName: string;
  email: string;
  role: "staff" | "admin";
}

interface MockRequest {
  id: string;
  referenceNumber: string;
  status: "pending" | "awaiting_payment" | "processing" | "on_hold" | "ready" | "claimed" | "cancelled";
  assignedTo: string | null;
  assignee: MockAssignee | null;
  createdAt: Date;
  turnaroundDays: number;
}

export function filterAssignedRequests(
  requests: MockRequest[],
  filter: { assignedTo?: string },
  currentUserId: string,
): MockRequest[] {
  if (!filter.assignedTo || filter.assignedTo === "all") return requests;

  if (filter.assignedTo === "me") {
    return requests.filter((r) => r.assignedTo === currentUserId);
  }

  if (filter.assignedTo === "unassigned") {
    return requests.filter((r) => r.assignedTo === null);
  }

  return requests.filter((r) => r.assignedTo === filter.assignedTo);
}

export type TriageCategory = "all" | "action_needed" | "in_production" | "sla_risk" | "ready";

export function categorizeRequest(req: MockRequest, now: Date = new Date()): TriageCategory[] {
  const categories: TriageCategory[] = ["all"];

  if (req.status === "pending" || req.status === "awaiting_payment" || req.status === "on_hold") {
    categories.push("action_needed");
  } else if (req.status === "processing") {
    categories.push("in_production");
  } else if (req.status === "ready") {
    categories.push("ready");
  }

  // SLA risk: SLA deadline is createdAt + turnaroundDays. If elapsed > 75% or overdue and not completed/ready
  const dueDate = new Date(req.createdAt.getTime() + req.turnaroundDays * 24 * 60 * 60 * 1000);
  const isPendingOrProcessing = req.status === "pending" || req.status === "processing";
  if (isPendingOrProcessing && now.getTime() >= dueDate.getTime() - 24 * 60 * 60 * 1000) {
    categories.push("sla_risk");
  }

  return categories;
}

function runTests() {
  console.log("Running Assigned Requests unit tests...");

  const staffUser: MockAssignee = {
    id: "staff-uuid-1",
    fullName: "Alyson Staff",
    email: "alyson.staff@tup.edu.ph",
    role: "staff",
  };

  const otherStaff: MockAssignee = {
    id: "staff-uuid-2",
    fullName: "Maria Staff",
    email: "maria.staff@tup.edu.ph",
    role: "staff",
  };

  const now = new Date("2026-10-22T10:00:00Z");

  const mockRequests: MockRequest[] = [
    {
      id: "req-1",
      referenceNumber: "REQ-2026-000001",
      status: "processing",
      assignedTo: staffUser.id,
      assignee: staffUser,
      createdAt: new Date("2026-10-21T08:00:00Z"),
      turnaroundDays: 3,
    },
    {
      id: "req-2",
      referenceNumber: "REQ-2026-000002",
      status: "pending",
      assignedTo: staffUser.id,
      assignee: staffUser,
      createdAt: new Date("2026-10-18T08:00:00Z"),
      turnaroundDays: 3, // Overdue by Oct 22
    },
    {
      id: "req-3",
      referenceNumber: "REQ-2026-000003",
      status: "ready",
      assignedTo: staffUser.id,
      assignee: staffUser,
      createdAt: new Date("2026-10-20T08:00:00Z"),
      turnaroundDays: 2,
    },
    {
      id: "req-4",
      referenceNumber: "REQ-2026-000004",
      status: "pending",
      assignedTo: otherStaff.id,
      assignee: otherStaff,
      createdAt: new Date("2026-10-21T08:00:00Z"),
      turnaroundDays: 3,
    },
    {
      id: "req-5",
      referenceNumber: "REQ-2026-000005",
      status: "pending",
      assignedTo: null,
      assignee: null,
      createdAt: new Date("2026-10-22T08:00:00Z"),
      turnaroundDays: 2,
    },
  ];

  // 1. Filter by assignedTo=me
  const myRequests = filterAssignedRequests(mockRequests, { assignedTo: "me" }, staffUser.id);
  assert.strictEqual(myRequests.length, 3);
  assert.strictEqual(myRequests.every((r) => r.assignedTo === staffUser.id), true);

  // 2. Filter by assignedTo=unassigned
  const unassigned = filterAssignedRequests(mockRequests, { assignedTo: "unassigned" }, staffUser.id);
  assert.strictEqual(unassigned.length, 1);
  assert.strictEqual(unassigned[0]?.id, "req-5");

  // 3. Filter by specific staff UUID
  const otherRequests = filterAssignedRequests(mockRequests, { assignedTo: otherStaff.id }, staffUser.id);
  assert.strictEqual(otherRequests.length, 1);
  assert.strictEqual(otherRequests[0]?.id, "req-4");

  // 4. Workload triage checks
  const req1Categories = categorizeRequest(mockRequests[0]!, now);
  assert.strictEqual(req1Categories.includes("in_production"), true);

  const req2Categories = categorizeRequest(mockRequests[1]!, now);
  assert.strictEqual(req2Categories.includes("action_needed"), true);
  assert.strictEqual(req2Categories.includes("sla_risk"), true); // Overdue

  const req3Categories = categorizeRequest(mockRequests[2]!, now);
  assert.strictEqual(req3Categories.includes("ready"), true);

  console.log("Assigned Requests unit tests passed successfully!");
}

runTests();
