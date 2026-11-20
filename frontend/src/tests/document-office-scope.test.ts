import assert from "node:assert/strict";
import {
  filterDocumentsForManager,
  isDocumentInStaffOffice,
  resolveDocumentOfficeCode,
  resolveStaffOfficeCode,
} from "../lib/documents/documents.ts";

assert.equal(
  resolveDocumentOfficeCode({
    code: "OVPAF-002",
    office: "registrar",
    officeRecord: {
      id: "ovpaf-id",
      code: "OVPAF",
      name: "VP for Admin & Finance",
      sector: "admin",
    },
  }),
  "OVPAF",
);

// Legacy fallback ignores misleading default office: "registrar" when code prefix specifies OVPAF
assert.equal(
  resolveDocumentOfficeCode({
    code: "OVPAF-002",
    office: "registrar",
    officeRecord: null,
  }),
  "OVPAF",
);

assert.equal(
  resolveDocumentOfficeCode({
    code: "LEGACY",
    office: "hr",
    officeRecord: null,
  }),
  "HRMO",
);

assert.equal(
  resolveDocumentOfficeCode({
    code: "LEGACY",
    office: "registrar",
    officeRecord: null,
  }),
  "OUR",
);

assert.equal(
  resolveStaffOfficeCode({
    role: "staff",
    office: "registrar",
    officeRecord: {
      id: "our-id",
      code: "OUR",
      name: "Registrar",
      sector: "academic",
    },
  }),
  "OUR",
);

assert.equal(
  resolveStaffOfficeCode({
    role: "staff",
    office: "hr",
    officeRecord: null,
  }),
  "HRMO",
);

assert.equal(
  resolveStaffOfficeCode({
    role: "staff",
    office: null,
    officeRecord: null,
  }),
  null,
);

const ourStaff = {
  role: "staff" as const,
  office: "registrar" as const,
  officeId: "uuid-our",
  officeRecord: {
    id: "uuid-our",
    code: "OUR",
    name: "Office of the University Registrar",
    sector: "academic",
  },
};

const hrmoStaff = {
  role: "staff" as const,
  office: "hr" as const,
  officeId: "uuid-hrmo",
  officeRecord: {
    id: "uuid-hrmo",
    code: "HRMO",
    name: "Human Resource Management Office",
    sector: "admin",
  },
};

const unassignedStaff = {
  role: "staff" as const,
  office: null,
  officeId: null,
  officeRecord: null,
};

const adminUser = {
  role: "admin" as const,
  office: null,
  officeId: null,
  officeRecord: null,
};

const studentUser = {
  role: "student" as const,
  office: null,
  officeId: null,
  officeRecord: null,
};

const docs = [
  {
    id: "d1",
    code: "OUR-001",
    office: "registrar" as const,
    officeId: null,
    officeRecord: null,
  },
  {
    id: "d2",
    code: "OVPAF-002",
    office: "registrar" as const,
    officeId: "uuid-ovpaf",
    officeRecord: {
      id: "uuid-ovpaf",
      code: "OVPAF",
      name: "OVPAF",
      sector: "admin",
    },
  },
  {
    id: "d3",
    code: "HRMO-001",
    office: "hr" as const,
    officeId: "uuid-hrmo",
    officeRecord: {
      id: "uuid-hrmo",
      code: "HRMO",
      name: "HRMO",
      sector: "admin",
    },
  },
];

assert.equal(isDocumentInStaffOffice(docs[0], ourStaff), true);
assert.equal(isDocumentInStaffOffice(docs[1], ourStaff), false);
assert.equal(isDocumentInStaffOffice(docs[2], ourStaff), false);
assert.equal(isDocumentInStaffOffice(docs[2], hrmoStaff), true);
assert.equal(isDocumentInStaffOffice(docs[0], unassignedStaff), false);
assert.equal(isDocumentInStaffOffice(docs[1], adminUser), true);
assert.equal(isDocumentInStaffOffice(docs[0], studentUser), false);
assert.equal(isDocumentInStaffOffice(docs[0], null), false);

// Direct officeId match takes precedence when both IDs exist
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "CUSTOM-001",
      office: "registrar",
      officeId: "uuid-our",
      officeRecord: null,
    },
    ourStaff,
  ),
  true,
);
assert.equal(
  isDocumentInStaffOffice(
    {
      code: "OUR-999",
      office: "registrar",
      officeId: "uuid-other",
      officeRecord: { id: "uuid-other", code: "OUR" },
    },
    ourStaff,
  ),
  false,
);

assert.deepEqual(
  filterDocumentsForManager(docs, ourStaff).map((d) => d.id),
  ["d1"],
);
assert.deepEqual(
  filterDocumentsForManager(docs, hrmoStaff).map((d) => d.id),
  ["d3"],
);
assert.deepEqual(
  filterDocumentsForManager(docs, adminUser).map((d) => d.id),
  ["d1", "d2", "d3"],
);
assert.deepEqual(filterDocumentsForManager(docs, unassignedStaff), []);
assert.deepEqual(filterDocumentsForManager(docs, studentUser), []);
assert.deepEqual(filterDocumentsForManager(docs, null), []);

console.log("document-office-scope tests passed");
