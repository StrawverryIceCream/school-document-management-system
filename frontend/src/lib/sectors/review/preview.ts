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
