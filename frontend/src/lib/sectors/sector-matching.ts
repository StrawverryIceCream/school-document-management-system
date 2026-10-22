import { buildQueueSummary, type QueueSummary } from "@/lib/shared/queue-card";
import type { DocumentRequestWithRelations } from "@/types";
import type { OfficeConfig } from "./sectors-config";

export function matchesOffice(
  request: DocumentRequestWithRelations,
  office: OfficeConfig,
): boolean {
  // 1. Match by explicit office record code or id
  const docOfficeCode =
    request.documentType?.officeRecord?.code?.toUpperCase() ??
    (request.documentTypeCode?.includes("-")
      ? request.documentTypeCode.split("-")[0].toUpperCase()
      : undefined);

  if (docOfficeCode && docOfficeCode === office.code.toUpperCase()) {
    return true;
  }

  // 2. Match by document code prefix (e.g. "OUR-001" starts with "OUR")
  if (office.docCodePrefix && request.documentTypeCode) {
    if (
      request.documentTypeCode
        .toUpperCase()
        .startsWith(office.docCodePrefix.toUpperCase())
    ) {
      return true;
    }
  }

  // 3. Match by student college (e.g. for academic colleges like COS, COE, CAFA)
  // ONLY applies if the document is an academic college document (COL or matching college code)
  if (office.collegeCode) {
    const isCollegeDoc =
      docOfficeCode === "COL" ||
      docOfficeCode === office.collegeCode.toUpperCase() ||
      request.documentTypeCode?.toUpperCase().startsWith("COL-") ||
      request.documentTypeCode?.toUpperCase().startsWith(`${office.collegeCode.toUpperCase()}-`);

    if (isCollegeDoc) {
      const userCollegeCode = request.user?.college?.code?.toUpperCase();
      if (userCollegeCode === office.collegeCode.toUpperCase()) {
        return true;
      }
    }
  }

  // 3. Match by faculty/staff department
  if (office.departmentMatch && request.user?.department) {
    const normUserDept = request.user.department.trim().toLowerCase();
    const normOfficeDept = office.departmentMatch.trim().toLowerCase();
    if (
      normUserDept.includes(normOfficeDept) ||
      normOfficeDept.includes(normUserDept)
    ) {
      return true;
    }
  }

  return false;
}

export function getOfficeSummary(
  requests: DocumentRequestWithRelations[],
  office: OfficeConfig,
): QueueSummary {
  const pending = requests.filter(
    (req) => req.status === "pending" && matchesOffice(req, office),
  );
  return buildQueueSummary(pending);
}
