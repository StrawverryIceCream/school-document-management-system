import assert from "node:assert";

export function resolveSearchRoute(query: string, userRole?: string | null): string | null {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const target = userRole === "admin" || userRole === "staff" ? "/all-request" : "/my-request";
  return `${target}?search=${encodeURIComponent(trimmed)}`;
}

export function parseSearchParam(searchString: string): string {
  const params = new URLSearchParams(searchString);
  return params.get("search") || "";
}

console.log("Running queue links & route resolution unit tests...");

// Test search route resolution for staff/admin
assert.strictEqual(
  resolveSearchRoute("Diploma Certificate", "admin"),
  "/all-request?search=Diploma%20Certificate",
);
assert.strictEqual(
  resolveSearchRoute("Transcript", "staff"),
  "/all-request?search=Transcript",
);

// Test search route resolution for student/applicant
assert.strictEqual(
  resolveSearchRoute("Grade Slip", "student"),
  "/my-request?search=Grade%20Slip",
);
assert.strictEqual(
  resolveSearchRoute("Form 137", null),
  "/my-request?search=Form%20137",
);

// Empty query returns null
assert.strictEqual(resolveSearchRoute("   ", "staff"), null);

// Test search param parsing from URL search query
assert.strictEqual(parseSearchParam("?search=Transcript%20Of%20Records"), "Transcript Of Records");
assert.strictEqual(parseSearchParam("?other=123"), "");
assert.strictEqual(parseSearchParam(""), "");

console.log("Queue links & route resolution unit tests passed!");
