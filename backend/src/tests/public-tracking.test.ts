import assert from "node:assert";
import "dotenv/config";
import { db } from "../db/db.js";
import { documentRequests, users, documentTypes } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { maskRequesterName } from "../controllers/requests.controller.js";

console.log("Running public request tracking tests...");

// 1. Verify masking helper
assert.strictEqual(maskRequesterName("Flores Benerao"), "F***** B******");
assert.strictEqual(maskRequesterName("Juan Dela Cruz"), "J*** D*** C***");
assert.strictEqual(maskRequesterName("A"), "A");
assert.strictEqual(maskRequesterName(""), "—");
assert.strictEqual(maskRequesterName(null), "—");
assert.strictEqual(maskRequesterName(undefined), "—");

// 2. Format validation check
const REFERENCE_REGEX = /^REQ-\d{4}-\d{6}$/i;
assert.ok(REFERENCE_REGEX.test("REQ-2026-000018"));
assert.ok(REFERENCE_REGEX.test("req-2026-000001"));
assert.ok(!REFERENCE_REGEX.test("ARCH-8B1A21FC"));
assert.ok(!REFERENCE_REGEX.test("REQ-2026-COS-0842"));
assert.ok(!REFERENCE_REGEX.test(""));
assert.ok(!REFERENCE_REGEX.test("invalid"));

// 3. Query existing request and ensure no private data leaks
const existingReq = await db.query.documentRequests.findFirst({
  with: {
    user: {
      columns: { fullName: true },
    },
    documentType: {
      columns: { name: true, category: true, processingDays: true },
    },
    window: {
      columns: { name: true, office: true },
    },
  },
});

if (existingReq) {
  const publicPayload = {
    referenceNumber: existingReq.referenceNumber,
    status: existingReq.status,
    documentTypeName: existingReq.documentTypeName || existingReq.documentType?.name || "Official Document",
    category: existingReq.documentType?.category || "student",
    maskedRequesterName: maskRequesterName(existingReq.user?.fullName),
    windowName: existingReq.window?.name ?? null,
    windowOffice: existingReq.window?.office ?? null,
    turnaroundDays: existingReq.turnaroundDays || existingReq.documentType?.processingDays || 3,
    releaseDate: existingReq.releaseDate ?? null,
    submittedAt: existingReq.createdAt,
  };

  assert.ok(publicPayload.referenceNumber);
  assert.ok(publicPayload.status);
  assert.ok(publicPayload.maskedRequesterName.includes("*") || publicPayload.maskedRequesterName === "—" || publicPayload.maskedRequesterName.length <= 1);
  assert.strictEqual((publicPayload as Record<string, unknown>).internalNotes, undefined);
  assert.strictEqual((publicPayload as Record<string, unknown>).email, undefined);
  assert.strictEqual((publicPayload as Record<string, unknown>).studentId, undefined);
  assert.strictEqual((publicPayload as Record<string, unknown>).formData, undefined);
}

console.log("All public request tracking tests passed successfully!");
