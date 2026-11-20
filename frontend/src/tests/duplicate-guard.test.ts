import assert from "node:assert/strict";
import {
  findActiveDuplicateRequest,
  getActiveDocumentTypeIds,
  type DuplicateCandidate,
} from "../lib/requests/duplicate-guard";

const sampleRequests: DuplicateCandidate[] = [
  {
    id: "r-1",
    documentTypeId: "doc-tor",
    referenceNumber: "REQ-2026-000001",
    status: "claimed",
    createdAt: "2026-01-10T08:00:00.000Z",
  },
  {
    id: "r-2",
    documentTypeId: "doc-cor",
    referenceNumber: "REQ-2026-000002",
    status: "pending",
    createdAt: "2026-02-01T08:00:00.000Z",
  },
  {
    id: "r-3",
    documentTypeId: "doc-cor",
    referenceNumber: "REQ-2026-000003",
    status: "processing",
    createdAt: "2026-02-15T08:00:00.000Z",
  },
  {
    id: "r-4",
    documentTypeId: "doc-gm",
    referenceNumber: "REQ-2026-000004",
    status: "rejected",
    createdAt: "2026-02-20T08:00:00.000Z",
  },
  {
    id: "r-5",
    documentTypeId: "doc-tcg",
    referenceNumber: "REQ-2026-000005",
    status: "cancelled",
    createdAt: "2026-02-21T08:00:00.000Z",
  },
  {
    id: "r-6",
    documentTypeId: "doc-diploma",
    referenceNumber: "REQ-2026-000006",
    status: "ready",
    createdAt: "2026-02-22T08:00:00.000Z",
  },
  {
    id: "r-7",
    documentTypeId: "doc-coe",
    referenceNumber: "REQ-2026-000007",
    status: "rejected",
    resubmissionAllowed: true,
    createdAt: "2026-02-23T08:00:00.000Z",
  },
  {
    id: "r-8",
    documentTypeId: "doc-loa",
    referenceNumber: "REQ-2026-000008",
    status: "rejected",
    resubmissionAllowed: false,
    createdAt: "2026-02-24T08:00:00.000Z",
  },
];

// 1. Terminal requests (claimed, final rejected, cancelled) do NOT trigger duplicate warning
assert.equal(findActiveDuplicateRequest(sampleRequests, "doc-tor"), null);
assert.equal(findActiveDuplicateRequest(sampleRequests, "doc-gm"), null);
assert.equal(findActiveDuplicateRequest(sampleRequests, "doc-tcg"), null);
assert.equal(findActiveDuplicateRequest(sampleRequests, "doc-loa"), null);

// 2. Active in-flight and resubmittable rejected requests return the most recent match
const corMatch = findActiveDuplicateRequest(sampleRequests, "doc-cor");
assert.ok(corMatch);
assert.equal(corMatch.referenceNumber, "REQ-2026-000003");
assert.equal(corMatch.status, "processing");

const diplomaMatch = findActiveDuplicateRequest(sampleRequests, "doc-diploma");
assert.ok(diplomaMatch);
assert.equal(diplomaMatch.referenceNumber, "REQ-2026-000006");

const coeMatch = findActiveDuplicateRequest(sampleRequests, "doc-coe");
assert.ok(coeMatch);
assert.equal(coeMatch.referenceNumber, "REQ-2026-000007");
assert.equal(coeMatch.resubmissionAllowed, true);

// 3. Unknown or null documentTypeId returns null
assert.equal(findActiveDuplicateRequest(sampleRequests, "doc-unknown"), null);
assert.equal(findActiveDuplicateRequest(sampleRequests, undefined), null);

// 4. getActiveDocumentTypeIds returns active in-flight and resubmittable documentTypeIds
const activeIds = getActiveDocumentTypeIds(sampleRequests);
assert.equal(activeIds.has("doc-cor"), true);
assert.equal(activeIds.has("doc-diploma"), true);
assert.equal(activeIds.has("doc-coe"), true);
assert.equal(activeIds.has("doc-tor"), false);
assert.equal(activeIds.has("doc-gm"), false);
assert.equal(activeIds.has("doc-tcg"), false);
assert.equal(activeIds.has("doc-loa"), false);

console.log("duplicate-guard tests passed");
