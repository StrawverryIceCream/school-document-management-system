import assert from "node:assert/strict";
import {
  canAccessAccounts,
  getDefaultHomeRoute,
  getStaffWorkspaceLink,
  isRegistrarStaff,
  REQUESTER_ROLES,
} from "../lib/navigation/role-access";

// 0. Requester role allowlist includes institutional staff & admins
assert.deepEqual([...REQUESTER_ROLES], ["student", "teacher", "admin", "staff"]);

// 1. Default home routes per role
assert.equal(getDefaultHomeRoute("student"), "/home");
assert.equal(getDefaultHomeRoute("teacher"), "/home");
assert.equal(getDefaultHomeRoute("staff"), "/dashboard");
assert.equal(getDefaultHomeRoute("admin"), "/dashboard");

// 2. Accounts access (admin + Registrar/OUR staff only)
assert.equal(
  canAccessAccounts({ role: "admin", office: null, officeRecord: null }),
  true,
);
assert.equal(
  canAccessAccounts({
    role: "staff",
    office: null,
    officeRecord: { id: "uuid-1", code: "OUR", name: "Office of the University Registrar" },
  }),
  true,
);
assert.equal(
  isRegistrarStaff({ role: "staff", office: "registrar", officeRecord: null }),
  true,
);
assert.equal(
  canAccessAccounts({
    role: "staff",
    office: "hr",
    officeRecord: { id: "uuid-2", code: "HRMO", name: "Human Resource Management Office" },
  }),
  false,
);
assert.equal(
  canAccessAccounts({ role: "student", office: null, officeRecord: null }),
  false,
);
assert.equal(
  canAccessAccounts({ role: "teacher", office: null, officeRecord: null }),
  false,
);

// 3. Scoped workspace quick-jump resolution
assert.equal(
  getStaffWorkspaceLink({
    role: "student",
    office: null,
    officeId: null,
    officeRecord: null,
  }),
  null,
);
assert.equal(
  getStaffWorkspaceLink({
    role: "teacher",
    office: null,
    officeId: null,
    officeRecord: null,
  }),
  null,
);

const hrmoJump = getStaffWorkspaceLink({
  role: "staff",
  office: "hr",
  officeId: "uuid-hrmo",
  officeRecord: { id: "uuid-hrmo", code: "HRMO", name: "Human Resource Management Office" },
});
assert.ok(hrmoJump);
assert.equal(hrmoJump.url, "/sectors/ovpaf/admin-services/hrmo");

const ourJump = getStaffWorkspaceLink({
  role: "staff",
  office: "registrar",
  officeId: "uuid-our",
  officeRecord: { id: "uuid-our", code: "OUR", name: "Office of the University Registrar" },
});
assert.ok(ourJump);
assert.equal(ourJump.url, "/sectors/ovpaa/academic-support/our");

const adminJump = getStaffWorkspaceLink({
  role: "admin",
  office: null,
  officeId: null,
  officeRecord: null,
});
assert.ok(adminJump);
assert.equal(adminJump.url, "/sectors/ovpaa/colleges");

console.log("role-access tests passed");
