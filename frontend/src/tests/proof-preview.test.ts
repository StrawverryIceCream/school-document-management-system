import assert from "node:assert";

export type PreviewMediaType = "image" | "pdf" | "unsupported";

export function resolvePreviewType(
  url: string | null | undefined,
  mimeType?: string | null,
): PreviewMediaType {
  if (!url) return "unsupported";

  if (mimeType) {
    const cleanMime = mimeType.toLowerCase();
    if (cleanMime.startsWith("image/")) return "image";
    if (cleanMime === "application/pdf") return "pdf";
  }

  const cleanUrl = url.split("?")[0].toLowerCase();
  if (
    cleanUrl.endsWith(".jpg") ||
    cleanUrl.endsWith(".jpeg") ||
    cleanUrl.endsWith(".png") ||
    cleanUrl.endsWith(".webp") ||
    cleanUrl.endsWith(".gif") ||
    cleanUrl.endsWith(".svg") ||
    cleanUrl.includes("/image/upload/")
  ) {
    return "image";
  }

  if (cleanUrl.endsWith(".pdf")) {
    return "pdf";
  }

  return "unsupported";
}

export function formatPaymentMetaItems(payment: {
  amount: string | number;
  method: string;
  referenceNumber?: string | null;
  receiptNumber?: string | null;
  status: string;
  submittedAt?: string;
}): Array<{ label: string; value: string }> {
  const items: Array<{ label: string; value: string }> = [
    { label: "Amount", value: `₱${Number(payment.amount).toFixed(2)}` },
    { label: "Method", value: payment.method.replace(/_/g, " ") },
    { label: "Status", value: payment.status.toUpperCase() },
  ];

  if (payment.referenceNumber) {
    items.push({ label: "Reference", value: payment.referenceNumber });
  }

  if (payment.receiptNumber) {
    items.push({ label: "Receipt", value: payment.receiptNumber });
  }

  return items;
}

console.log("Running in-situ preview & format tests...");

// Test image resolution
assert.strictEqual(
  resolvePreviewType("https://res.cloudinary.com/test/image/upload/v1/payment.png"),
  "image",
);
assert.strictEqual(
  resolvePreviewType("https://example.com/receipt.jpg?token=abc"),
  "image",
);
assert.strictEqual(
  resolvePreviewType("https://example.com/file", "image/webp"),
  "image",
);

// Test PDF resolution
assert.strictEqual(
  resolvePreviewType("https://example.com/clearance.pdf"),
  "pdf",
);
assert.strictEqual(
  resolvePreviewType("https://example.com/download/file", "application/pdf"),
  "pdf",
);

// Test unsupported / null handling
assert.strictEqual(resolvePreviewType(null), "unsupported");
assert.strictEqual(resolvePreviewType(undefined), "unsupported");
assert.strictEqual(
  resolvePreviewType("https://example.com/archive.zip"),
  "unsupported",
);

// Test payment meta item generation
const meta1 = formatPaymentMetaItems({
  amount: "150.00",
  method: "gcash",
  referenceNumber: "GCASH-9912",
  status: "pending",
});

assert.strictEqual(meta1.some((m) => m.label === "Amount" && m.value === "₱150.00"), true);
assert.strictEqual(meta1.some((m) => m.label === "Method" && m.value === "gcash"), true);
assert.strictEqual(meta1.some((m) => m.label === "Reference" && m.value === "GCASH-9912"), true);
assert.strictEqual(meta1.some((m) => m.label === "Receipt"), false);

const meta2 = formatPaymentMetaItems({
  amount: 25.5,
  method: "over_the_counter",
  receiptNumber: "OR-008172",
  status: "verified",
});

assert.strictEqual(meta2.some((m) => m.label === "Amount" && m.value === "₱25.50"), true);
assert.strictEqual(meta2.some((m) => m.label === "Method" && m.value === "over the counter"), true);
assert.strictEqual(meta2.some((m) => m.label === "Receipt" && m.value === "OR-008172"), true);

console.log("In-situ preview & format tests passed!");
