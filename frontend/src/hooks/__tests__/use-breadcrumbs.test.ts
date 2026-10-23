import assert from "node:assert/strict";
import { documentNameCache } from "../../api/documents";
import { requestReferenceCache } from "../../api/requests";
import { toBreadcrumbLabel } from "../useBreadcrumbs";
import { getSector, getDivision, getOffice } from "../../lib/sectors/sectors-config";

function runTests() {
  console.log("Running use-breadcrumbs and label resolution tests...");

  // 1. toBreadcrumbLabel transforms kebab-case and snake-case
  assert.equal(toBreadcrumbLabel("new-request"), "New Request");
  assert.equal(toBreadcrumbLabel("assigned-request"), "Assigned Request");
  assert.equal(toBreadcrumbLabel("academic-support"), "Academic Support");

  // 2. documentNameCache seeds and returns document name
  const docId = "doc-test-1234";
  const docName = "Official Transcript of Records (TOR)";
  documentNameCache.set(docId, docName);
  assert.equal(documentNameCache.get(docId), docName);

  // 3. requestReferenceCache seeds and returns reference number
  const reqId = "req-test-5678";
  const refNumber = "REQ-2026-0099";
  requestReferenceCache.set(reqId, refNumber);
  assert.equal(requestReferenceCache.get(reqId), refNumber);

  // 4. Test breadcrumb segments simulation for /new-request/:id
  const newRequestSegments = ["new-request", docId];
  const newRequestCrumbs = newRequestSegments.map((segment, index) => {
    const prev = index > 0 ? newRequestSegments[index - 1] : "";
    let label = toBreadcrumbLabel(segment);
    if (prev === "new-request") {
      label = documentNameCache.get(segment) ?? "Document Details";
    }
    return { label, to: `/${newRequestSegments.slice(0, index + 1).join("/")}` };
  });

  assert.equal(newRequestCrumbs[0].label, "New Request");
  assert.equal(newRequestCrumbs[0].to, "/new-request");
  assert.equal(newRequestCrumbs[1].label, docName);
  assert.equal(newRequestCrumbs[1].to, `/new-request/${docId}`);

  // 5. Test breadcrumb segments simulation for Review Route
  // Route: /sectors/ovpaa/academic-support/our/requests/:requestId
  const reviewSegments = ["sectors", "ovpaa", "academic-support", "our", "requests", reqId];
  const isSectorRoute = reviewSegments[0] === "sectors";
  const sectorId = reviewSegments[1];
  const divisionId = reviewSegments[2];
  const officeId = reviewSegments[3];

  const reviewCrumbs = reviewSegments.map((segment, index) => {
    const prev = index > 0 ? reviewSegments[index - 1] : "";
    let to = `/${reviewSegments.slice(0, index + 1).join("/")}`;
    let label = toBreadcrumbLabel(segment);

    if (prev === "requests") {
      label = requestReferenceCache.get(segment) ?? "Review Request";
    } else if (segment === "requests" && isSectorRoute && sectorId && divisionId && officeId) {
      to = `/sectors/${sectorId}/${divisionId}/${officeId}`;
      label = "Requests";
    } else if (isSectorRoute && index === 1) {
      label = getSector(segment)?.code ?? toBreadcrumbLabel(segment);
    } else if (isSectorRoute && index === 2 && sectorId) {
      label = getDivision(sectorId, segment)?.name ?? toBreadcrumbLabel(segment);
    } else if (isSectorRoute && index === 3 && sectorId && divisionId) {
      label = getOffice(sectorId, divisionId, segment)?.code ?? toBreadcrumbLabel(segment);
    }

    return { label, to };
  });

  assert.equal(reviewCrumbs[0].label, "Sectors");
  assert.equal(reviewCrumbs[1].label, "OVPAA");
  assert.equal(reviewCrumbs[2].label, "Academic Support & Student Services");
  assert.equal(reviewCrumbs[3].label, "OUR");
  assert.equal(reviewCrumbs[4].label, "Requests");
  assert.equal(reviewCrumbs[4].to, "/sectors/ovpaa/academic-support/our");
  // Most important assertion: shows reference number instead of reqId!
  assert.equal(reviewCrumbs[5].label, refNumber);
  assert.equal(reviewCrumbs[5].to, `/sectors/ovpaa/academic-support/our/requests/${reqId}`);

  console.log("✅ All use-breadcrumbs tests passed successfully!");
}

runTests();
