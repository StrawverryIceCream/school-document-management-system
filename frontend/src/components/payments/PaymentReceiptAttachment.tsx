import { useEffect, useMemo, type ChangeEvent } from "react";
import { FileText } from "lucide-react";
import {
  PAYMENT_PROOF_ACCEPT,
  PAYMENT_PROOF_MAX_SIZE_LABEL,
} from "@/lib/payment-proof";

interface PaymentReceiptAttachmentProps {
  id: string;
  file: File | null;
  error: string | null;
  onSelect: (file: File | undefined) => void;
}

function PaymentReceiptAttachment({
  id,
  file,
  error,
  onSelect,
}: PaymentReceiptAttachmentProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onSelect(event.currentTarget.files?.[0]);
    event.currentTarget.value = "";
  }

  const previewUrl = useMemo(
    () =>
      file?.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    [file],
  );

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  return (
    <div className="min-w-0 space-y-3">
      {file ? (
        <div className="min-w-0 space-y-3 rounded-lg border p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Selected payment receipt: ${file.name}`}
              className="mx-auto block max-h-80 max-w-full rounded-md object-contain"
            />
          ) : (
            <div className="flex items-center gap-3 rounded-md bg-muted p-4">
              <FileText className="size-8 text-muted-foreground" />
              <p className="break-all text-sm font-medium">{file.name}</p>
            </div>
          )}
          <p className="break-all text-sm text-muted-foreground">
            Selected proof: {file.name}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm hover:bg-muted">
              <span className="font-medium">Take a Different Photo</span>
              <span className="text-muted-foreground">
                Use your device camera if available.
              </span>
              <input
                className="sr-only"
                type="file"
                accept={PAYMENT_PROOF_ACCEPT}
                capture="environment"
                onChange={handleFileChange}
              />
            </label>
            <label className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm hover:bg-muted">
              <span className="font-medium">Choose a Different Receipt</span>
              <span className="text-muted-foreground">
                Select another supported image.
              </span>
              <input
                className="sr-only"
                id={id}
                type="file"
                accept={PAYMENT_PROOF_ACCEPT}
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm hover:bg-muted">
            <span className="font-medium">Take Photo</span>
            <span className="text-muted-foreground">
              Use your device camera if available.
            </span>
            <input
              className="sr-only"
              type="file"
              accept={PAYMENT_PROOF_ACCEPT}
              capture="environment"
              onChange={handleFileChange}
            />
          </label>
          <label className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm hover:bg-muted">
            <span className="font-medium">Attach Receipt</span>
            <span className="text-muted-foreground">
              Choose a JPG, PNG, WebP, or AVIF image up to{" "}
              {PAYMENT_PROOF_MAX_SIZE_LABEL}.
            </span>
            <input
              className="sr-only"
              id={id}
              type="file"
              accept={PAYMENT_PROOF_ACCEPT}
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export default PaymentReceiptAttachment;
