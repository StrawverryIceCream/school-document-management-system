import assert from "node:assert";

export function parseScannedReference(input: string): string {
  const trimmed = input.trim();
  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const url = new URL(trimmed);
      const ref = url.searchParams.get("ref");
      if (ref) return ref.trim();
      const id = url.searchParams.get("id");
      if (id) return id.trim();
    }
  } catch {
    // not a valid URL
  }

  const match = trimmed.match(/REQ-\d{4}-\d+/i);
  if (match) return match[0].toUpperCase();

  return trimmed;
}

console.log("Running QR reference parser tests...");
assert.strictEqual(
  parseScannedReference("https://arch.edu/requests/claim?ref=REQ-2026-000008"),
  "REQ-2026-000008",
);
assert.strictEqual(
  parseScannedReference("http://localhost:5173/requests/claim?ref=REQ-2026-000123&utm=xyz"),
  "REQ-2026-000123",
);
assert.strictEqual(
  parseScannedReference("req-2026-000042"),
  "REQ-2026-000042",
);
assert.strictEqual(
  parseScannedReference("   REQ-2026-000099   "),
  "REQ-2026-000099",
);
console.log("QR reference parser tests passed!");
