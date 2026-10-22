import { findOfficeRoute } from "../sectors-config.js";

function getRequestReviewUrl(req: {
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

export function runTests() {
  console.log("Running RequestTable review link route tests...");

  const url = getRequestReviewUrl({
    id: "req-abc-123",
    officeCode: "OUR",
    documentTypeCode: "OUR-001",
  });

  console.assert(
    url === "/sectors/ovpaa/academic-support/our/requests/req-abc-123",
    `Expected direct review link, got: ${url}`
  );

  const collegeUrl = getRequestReviewUrl({
    id: "req-col-456",
    officeCode: "COL",
    college: "CAFA",
    documentTypeCode: "COL-001",
  });

  console.assert(
    collegeUrl === "/sectors/ovpaa/colleges/cafa/requests/req-col-456",
    `Expected college review link, got: ${collegeUrl}`
  );

  console.log("RequestTable review link route tests passed!");
}

runTests();
