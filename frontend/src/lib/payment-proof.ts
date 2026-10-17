export const PAYMENT_PROOF_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const PAYMENT_PROOF_MAX_SIZE_LABEL = "5 MB";
export const PAYMENT_PROOF_ACCEPT =
  "image/jpeg,image/png,image/webp,image/avif";

const PAYMENT_PROOF_ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export function validatePaymentProof(file: File): string | null {
  if (!PAYMENT_PROOF_ALLOWED_TYPES.has(file.type)) {
    return "Select a JPG, PNG, WebP, or AVIF image.";
  }

  if (file.size > PAYMENT_PROOF_MAX_SIZE_BYTES) {
    return `Receipt must be ${PAYMENT_PROOF_MAX_SIZE_LABEL} or smaller.`;
  }

  return null;
}
