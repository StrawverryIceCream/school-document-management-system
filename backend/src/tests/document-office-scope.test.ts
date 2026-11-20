import assert from "node:assert/strict";
import {
  canStaffManageDocument,
  hasCrossOfficeReassignmentAttempt,
  isDocumentInStaffOffice,
  resolveDocumentOfficeCode,
  resolveStaffOfficeCode,
} from "../lib/document-office-scope.js";

console.log("Running backend document office scope tests...");

const ourStaff = {
  id: "staff-our",
  role: "staff" as const,
  office: "registrar" as const,
  officeId: "uuid-our",
  officeCode: "OUR",
};

const hrmoStaff = {
  id: "staff-hrmo",
  role: "staff" as const,
  office: "hr" as const,
  officeId: "uuid-hrmo",
  officeCode: "HRMO",
};

const tloStaff = {
  id: "staff-tlo",
  role: "staff" as const,
  office: "registrar" as const,
  officeId: "uuid-tlo",
  officeCode: "TLO-ITSO",
};

const ovpafDoc = {
  id: "doc-ovpaf",
  code: "OVPAF-002",
  office: "registrar" as const,
  officeId: "uuid-ovpaf",
  officeCode: "OVPAF",
};

const ourLegacyDoc = {
  id: "doc-our-legacy",
  code: "OUR-001",
  office: "registrar" as const,
  officeId: null,
  officeCode: null,
};

const hrmoDoc = {
  id: "doc-hrmo",
  code: "HRMO-001",
  office: "hr" as const,
  officeId: "uuid-hrmo",
  officeCode: "HRMO",
};

const tloDoc = {
  id: "doc-tlo",
  code: "TLO-001",
  office: "registrar" as const,
  officeId: "uuid-tlo",
  officeCode: "TLO-ITSO",
};

const unassignedStaff = {
  id: "no-office",
  role: "staff" as const,
  office: null,
  officeId: null,
  officeCode: null,
};

const adminActor = {
  id: "admin-1",
  role: "admin" as const,
  office: null,
  officeId: null,
  officeCode: null,
};

const studentActor = {
  id: "student-1",
  role: "student" as const,
  office: null,
  officeId: null,
  officeCode: null,
};

const teacherActor = {
  id: "teacher-1",
  role: "teacher" as const,
  office: null,
  officeId: null,
  officeCode: null,
};

// 1. Office code resolution, case/whitespace normalization, and hyphenated office codes
assert.equal(resolveDocumentOfficeCode(ovpafDoc), "OVPAF");
assert.equal(resolveDocumentOfficeCode(ourLegacyDoc), "OUR");
assert.equal(resolveDocumentOfficeCode(tloDoc), "TLO-ITSO");
assert.equal(
  resolveDocumentOfficeCode({
    code: "  ovpaf-002  ",
    office: "registrar",
    officeId: null,
    officeCode: null,
  }),
  "OVPAF",
);
assert.equal(
  resolveDocumentOfficeCode({
    code: "  tlo-itso-001 ",
    office: "registrar",
    officeId: null,
    officeCode: null,
  }),
  "TLO-ITSO",
);
assert.equal(
  resolveDocumentOfficeCode({
    code: "CUSTOM-001",
    office: "registrar",
    officeId: null,
    officeCode: "  tlo-itso ",
  }),
  "TLO-ITSO",
);
assert.equal(
  resolveDocumentOfficeCode({
    code: "LEGACY",
    office: "hr",
    officeId: null,
    officeCode: null,
  }),
  "HRMO",
);
assert.equal(
  resolveDocumentOfficeCode({
    code: "LEGACY",
    office: "registrar",
    officeId: null,
    officeCode: null,
  }),
  "OUR",
);
assert.equal(
  resolveDocumentOfficeCode({
    code: "LEGACY",
    office: null,
    officeId: null,
    officeCode: null,
  }),
  null,
);

assert.equal(resolveStaffOfficeCode(ourStaff), "OUR");
assert.equal(
  resolveStaffOfficeCode({ office: "registrar", officeCode: "  tlo-itso  " }),
  "TLO-ITSO",
);
assert.equal(
  resolveStaffOfficeCode({ office: "hr", officeCode: "   " }),
  "HRMO",
);
assert.equal(resolveStaffOfficeCode(unassignedStaff), null);
assert.equal(resolveStaffOfficeCode(null), null);

// 2. Office scoping & empty/null officeId fallback
assert.equal(isDocumentInStaffOffice(ourLegacyDoc, ourStaff), true);
assert.equal(isDocumentInStaffOffice(ovpafDoc, ourStaff), false);
assert.equal(isDocumentInStaffOffice(hrmoDoc, ourStaff), false);
assert.equal(isDocumentInStaffOffice(hrmoDoc, hrmoStaff), true);
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "  tlo-itso-001 ",
      office: "registrar",
      officeId: null,
      officeCode: null,
    },
    tloStaff,
  ),
  true,
);
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "TLO-ITSO-001",
      office: "registrar",
      officeId: null,
      officeCode: null,
    },
    ourStaff,
  ),
  false,
);
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "OUR-001",
      office: "registrar",
      officeId: "   ",
      officeCode: null,
    },
    ourStaff,
  ),
  true,
);
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "OUR-001",
      office: "registrar",
      officeId: " uuid-our ",
      officeCode: null,
    },
    { ...ourStaff, officeId: "uuid-our" },
  ),
  true,
);
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "OVPAF-002",
      office: "registrar",
      officeId: "",
      officeCode: null,
    },
    ourStaff,
  ),
  false,
);

// 3. Direct officeId mismatch wins even on non-dashed legacy code
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "LEGACY",
      office: "registrar",
      officeId: "uuid-other",
      officeCode: null,
    },
    ourStaff,
  ),
  false,
);
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "LEGACY",
      office: "registrar",
      officeId: "uuid-our",
      officeCode: null,
    },
    ourStaff,
  ),
  true,
);

// 4. Manageability checks: unassigned fail-closed, non-staff rejection, admin bypass
assert.equal(canStaffManageDocument(ourLegacyDoc, ourStaff), true);
assert.equal(canStaffManageDocument(hrmoDoc, ourStaff), false);
assert.equal(canStaffManageDocument(ourLegacyDoc, unassignedStaff), false);
assert.equal(
  canStaffManageDocument(
    { code: "LEGACY", office: null, officeId: null, officeCode: null },
    unassignedStaff,
  ),
  false,
);
assert.equal(canStaffManageDocument(ourLegacyDoc, studentActor), false);
assert.equal(canStaffManageDocument(ourLegacyDoc, teacherActor), false);
assert.equal(canStaffManageDocument(ourLegacyDoc, null), false);
assert.equal(canStaffManageDocument(ourLegacyDoc, undefined), false);
assert.equal(canStaffManageDocument(hrmoDoc, adminActor), true);
assert.equal(canStaffManageDocument(ovpafDoc, adminActor), true);

// 5. Cross-office reassignment guard
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { fee: 150, processingDays: 5 },
    ourStaff,
  ),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { officeId: "uuid-hrmo" },
    ourStaff,
  ),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { officeId: "" }, ourStaff),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { officeId: null }, ourStaff),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { officeId: " uuid-our " },
    ourStaff,
  ),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { officeId: "uuid-hrmo" },
    { ...ourStaff, officeId: null },
  ),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { officeId: "   " },
    { ...ourStaff, officeId: null },
  ),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(ourLegacyDoc, { office: "hr" }, ourStaff),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { office: "registrar" },
    ourStaff,
  ),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { code: "HRMO-999" },
    ourStaff,
  ),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { code: "  tlo-itso-001 " },
    ourStaff,
  ),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { code: "  our-010  " },
    ourStaff,
  ),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(tloDoc, { code: "TLO-001" }, tloStaff),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(tloDoc, { code: "TLO-ITSO-002" }, tloStaff),
  false,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(tloDoc, { code: "HRMO-001" }, tloStaff),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { fee: 100 },
    studentActor,
  ),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { fee: 100 },
    null,
  ),
  true,
);
assert.equal(
  hasCrossOfficeReassignmentAttempt(
    ourLegacyDoc,
    { officeId: "uuid-hrmo", office: "hr", code: "HRMO-999" },
    adminActor,
  ),
  false,
);

console.log("Backend document office scope tests passed!");
