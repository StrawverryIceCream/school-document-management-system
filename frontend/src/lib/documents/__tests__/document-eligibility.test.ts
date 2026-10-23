import assert from "node:assert/strict";
import { isDocumentEligible } from "../eligibility";
import type { DocumentType, AuthUser } from "@/types";

function runTests() {
  console.log("Running document-eligibility test...");

  const baseDoc: Partial<DocumentType> = {
    id: "doc-1",
    name: "Transcript of Records",
    code: "TOR",
    isActive: true,
    allowedCategories: ["student"],
    allowedStudentStatuses: ["graduating", "alumni"],
  };

  const graduatingStudent: Partial<AuthUser> = {
    id: "user-1",
    role: "student",
    studentStatus: "graduating",
  };

  const regularStudent: Partial<AuthUser> = {
    id: "user-2",
    role: "student",
    studentStatus: "regular",
  };

  const teacher: Partial<AuthUser> = {
    id: "user-3",
    role: "teacher",
    studentStatus: null,
  };

  // 1. Inactive documents are never eligible
  assert.equal(
    isDocumentEligible({ ...baseDoc, isActive: false } as DocumentType, graduatingStudent as AuthUser),
    false,
    "Inactive document must not be eligible"
  );

  // 2. Graduating student can see graduating document
  assert.equal(
    isDocumentEligible(baseDoc as DocumentType, graduatingStudent as AuthUser),
    true,
    "Graduating student must be eligible for graduating document"
  );

  // 3. Regular student cannot see graduating document
  assert.equal(
    isDocumentEligible(baseDoc as DocumentType, regularStudent as AuthUser),
    false,
    "Regular student must NOT be eligible for graduating/alumni document"
  );

  // 4. Open document (empty allowedStudentStatuses) is eligible for all students
  const openDoc: Partial<DocumentType> = {
    ...baseDoc,
    allowedStudentStatuses: [],
  };
  assert.equal(
    isDocumentEligible(openDoc as DocumentType, regularStudent as AuthUser),
    true,
    "Regular student must be eligible for open document"
  );

  // 5. Role mismatch: teacher cannot request student-only document
  assert.equal(
    isDocumentEligible(baseDoc as DocumentType, teacher as AuthUser),
    false,
    "Teacher must not be eligible for student-only document"
  );

  // 6. Teacher can request teacher document
  const teacherDoc: Partial<DocumentType> = {
    ...baseDoc,
    allowedCategories: ["teacher"],
    allowedStudentStatuses: [],
  };
  assert.equal(
    isDocumentEligible(teacherDoc as DocumentType, teacher as AuthUser),
    true,
    "Teacher must be eligible for teacher document"
  );

  // 7. Admin user can request all available documents (student-only, status-restricted, teacher-only)
  const admin: Partial<AuthUser> = {
    id: "user-admin",
    role: "admin",
    studentStatus: null,
  };
  assert.equal(
    isDocumentEligible(baseDoc as DocumentType, admin as AuthUser),
    true,
    "Admin must be eligible for student/status-restricted document"
  );
  assert.equal(
    isDocumentEligible(teacherDoc as DocumentType, admin as AuthUser),
    true,
    "Admin must be eligible for teacher document"
  );
  assert.equal(
    isDocumentEligible({ ...baseDoc, isActive: false } as DocumentType, admin as AuthUser),
    false,
    "Admin must not be eligible for inactive document"
  );

  console.log("✅ document-eligibility tests passed!");
}

runTests();
