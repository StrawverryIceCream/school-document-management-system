import { findOfficeRoute } from "../sectors-config";

export function getAssignedReviewUrl(req: {
  id: string;
  officeCode?: string;
  officeId?: string;
  officeName?: string;
  sector?: string;
  documentTypeCode?: string;
  college?: string;
}): string | undefined {
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

  return route ? `${route.url}/requests/${req.id}` : undefined;
}

export type TriageTab = "all" | "action_needed" | "in_production" | "sla_risk" | "ready";

export function getTriageTabsForRequest(req: {
  status: string;
  submittedAt?: string | null;
  processingDays?: number;
}, nowMs: number = Date.now()): TriageTab[] {
  const tabs: TriageTab[] = ["all"];

  if (req.status === "pending" || req.status === "awaiting_payment" || req.status === "on_hold") {
    tabs.push("action_needed");
  } else if (req.status === "processing") {
    tabs.push("in_production");
  } else if (req.status === "ready") {
    tabs.push("ready");
  }

  if (req.submittedAt && (req.status === "pending" || req.status === "processing")) {
    const submittedMs = new Date(req.submittedAt).getTime();
    const days = req.processingDays ?? 3;
    const dueMs = submittedMs + days * 24 * 60 * 60 * 1000;
    // SLA at risk if due within 24h or overdue
    if (nowMs >= dueMs - 24 * 60 * 60 * 1000) {
      tabs.push("sla_risk");
    }
  }

  return tabs;
}

export function runTests() {
  console.log("Running Assigned Requests route and triage tests...");

  // 1. Direct review routing test
  const ourUrl = getAssignedReviewUrl({
    id: "req-assigned-101",
    officeCode: "OUR",
    documentTypeCode: "OUR-001",
  });
  console.assert(
    ourUrl === "/sectors/ovpaa/academic-support/our/requests/req-assigned-101",
    `Expected OUR review link, got: ${ourUrl}`,
  );

  const collegeUrl = getAssignedReviewUrl({
    id: "req-assigned-202",
    officeCode: "COL",
    college: "COS",
    documentTypeCode: "COL-002",
  });
  console.assert(
    collegeUrl === "/sectors/ovpaa/colleges/cos/requests/req-assigned-202",
    `Expected college review link, got: ${collegeUrl}`,
  );

  // 2. Triage tab classification test
  const now = new Date("2026-10-22T10:00:00Z").getTime();

  const pendingTabs = getTriageTabsForRequest({
    status: "pending",
    submittedAt: "2026-10-20T08:00:00Z",
    processingDays: 3, // Due Oct 23, within 24h of Oct 22
  }, now);
  console.assert(pendingTabs.includes("action_needed"), "Should include action_needed");
  console.assert(pendingTabs.includes("sla_risk"), "Should include sla_risk");

  const readyTabs = getTriageTabsForRequest({
    status: "ready",
    submittedAt: "2026-10-20T08:00:00Z",
    processingDays: 3,
  }, now);
  console.assert(readyTabs.includes("ready"), "Should include ready");
  console.assert(!readyTabs.includes("action_needed"), "Should not include action_needed");

  console.log("Assigned Requests route and triage tests passed!");
}

runTests();

