import { useEffect, useMemo } from "react";
import { FileText } from "lucide-react";

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
    <div className="space-y-3">
      {file ? (
        <div className="space-y-3 rounded-lg border p-3">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={`Selected payment receipt: ${file.name}`}
              className="max-h-80 w-full rounded-md object-contain"
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
              accept="image/*"
              capture="environment"
              onChange={(event) => onSelect(event.currentTarget.files?.[0])}
            />
          </label>
          <label className="flex cursor-pointer flex-col gap-2 rounded-lg border p-4 text-sm hover:bg-muted">
            <span className="font-medium">Attach Receipt</span>
            <span className="text-muted-foreground">
              Choose an image or PDF.
            </span>
            <input
              className="sr-only"
              id={id}
              type="file"
              accept="image/*,.pdf"
              onChange={(event) => onSelect(event.currentTarget.files?.[0])}
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
