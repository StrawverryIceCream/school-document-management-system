import assert from "node:assert";
import "dotenv/config";
import { db } from "../db/db.js";
import {
  documentRequests,
  users,
  documentTypes,
} from "../db/schema.js";
import { or, and, ilike, inArray, desc, count, sql } from "drizzle-orm";

console.log("Running requests search query tests with reference number and role casting...");

async function runSearchQuery(searchTerm: string) {
  const pattern = `%${searchTerm.trim()}%`;
  const conditions = [
    or(
      ilike(documentRequests.referenceNumber, pattern),
      ilike(documentRequests.purpose, pattern),
      ilike(documentRequests.internalNotes, pattern),
      inArray(
        documentRequests.userId,
        db
          .select({ id: users.id })
          .from(users)
          .where(
            or(
              ilike(users.fullName, pattern),
              ilike(users.studentId, pattern),
              ilike(users.email, pattern),
              ilike(sql`${users.role}::text`, pattern),
            ),
          ),
      ),
      inArray(
        documentRequests.documentTypeId,
        db
          .select({ id: documentTypes.id })
          .from(documentTypes)
          .where(
            or(
              ilike(documentTypes.name, pattern),
              ilike(documentTypes.code, pattern),
              ilike(documentTypes.description, pattern),
            ),
          ),
      ),
    ),
  ];

  const whereClause = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db.query.documentRequests.findMany({
      where: whereClause,
      limit: 10,
      orderBy: [desc(documentRequests.createdAt)],
    }),
    db.select({ total: count() }).from(documentRequests).where(whereClause),
  ]);

  return { data, total: totalResult[0]?.total ?? 0 };
}

// 1. Search by reference number should not throw operator does not exist error
const refResult = await runSearchQuery("REQ-2026-000018");
assert.ok(Array.isArray(refResult.data));
assert.ok(typeof refResult.total === "number");

// 2. Search by role string should not throw enum error
const roleResult = await runSearchQuery("student");
assert.ok(Array.isArray(roleResult.data));

console.log("All requests search tests passed successfully!");
