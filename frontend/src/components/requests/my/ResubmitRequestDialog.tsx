import { useState } from "react";
import { AlertCircle, FileUp, LoaderCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resubmitMyRequest } from "@/api/requests";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

interface ResubmitRequestDialogProps {
  request: MyRequestWithDocumentName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => Promise<void> | void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResubmitRequestDialog({
  request,
  open,
  onOpenChange,
  onSuccess,
}: ResubmitRequestDialogProps) {
  const [prevKey, setPrevKey] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dialogKey = open && request ? `${request.id}:${request.updatedAt}` : null;
  if (dialogKey !== prevKey) {
    setPrevKey(dialogKey);
    if (dialogKey) {
      setResponses({});
      setFiles({});
      setError(null);
    }
  }

  if (!request) return null;

  const missedRequirements = request.missedRequirements ?? [];

  function clearSelectedFile(key: string, input?: HTMLInputElement) {
    if (input) input.value = "";
    setFiles((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleFileChange(
    key: string,
    file: File | null,
    input?: HTMLInputElement,
  ) {
    setError(null);
    if (!file) {
      clearSelectedFile(key, input);
      return;
    }

    const lowerName = file.name.toLowerCase();
    const validExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    if (!validExt) {
      clearSelectedFile(key, input);
      setError("Only PDF, JPG, PNG, or WebP files are allowed.");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      clearSelectedFile(key, input);
      setError(`"${file.name}" exceeds the 5 MB file limit.`);
      return;
    }

    setFiles((prev) => ({ ...prev, [key]: file }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;
    setError(null);

    for (const item of missedRequirements) {
      if (item.type === "file") {
        if (item.required && !files[item.key]) {
          setError(`Please upload "${item.label}".`);
          return;
        }
      } else {
        const value = responses[item.key]?.trim() ?? "";
        if (item.required && !value) {
          setError(`Please provide "${item.label}".`);
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const fileEntries = Object.entries(files).map(([key, file]) => ({
        key,
        file,
      }));
      await resubmitMyRequest(request.id, {
        responses,
        files: fileEntries,
      });
      toast.success("Request resubmitted for review.");
      await onSuccess();
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not resubmit request.";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && submitting) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <RotateCcw className="size-4 text-primary" aria-hidden="true" />
            Fix &amp; Resubmit Request
          </DialogTitle>
          <DialogDescription>
            {request.documentName} &bull;{" "}
            <span className="font-mono font-semibold text-foreground">
              {request.referenceNumber}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs space-y-1">
          <span className="font-semibold uppercase tracking-wider text-destructive block">
            Rejection Reason
          </span>
          <p className="text-sm text-foreground leading-relaxed">
            {request.remarks || "No rejection reason provided."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {missedRequirements.length > 0 ? (
            <div className="space-y-3.5">
              {missedRequirements.map((item) => {
                const selectedFile = files[item.key];
                return (
                  <div key={item.key} className="space-y-1.5">
                    <Label
                      htmlFor={`resubmit-${item.key}`}
                      className="text-xs font-semibold"
                    >
                      {item.label}
                      {item.required && (
                        <span className="text-destructive ml-0.5">*</span>
                      )}
                    </Label>

                    {item.type === "file" ? (
                      <div className="space-y-1.5">
                        <Input
                          id={`resubmit-${item.key}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          disabled={submitting}
                          onChange={(e) =>
                            handleFileChange(
                              item.key,
                              e.target.files?.[0] ?? null,
                              e.currentTarget,
                            )
                          }
                          className="cursor-pointer text-xs"
                        />
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                          <FileUp className="size-3 shrink-0" aria-hidden="true" />
                          {selectedFile
                            ? `Selected: ${selectedFile.name} (${formatBytes(selectedFile.size)})`
                            : "Accepted: PDF, JPG, PNG, WebP (max 5 MB)"}
                        </p>
                      </div>
                    ) : item.type === "textarea" ? (
                      <Textarea
                        id={`resubmit-${item.key}`}
                        rows={3}
                        maxLength={2000}
                        disabled={submitting}
                        placeholder={`Enter ${item.label.toLowerCase()}...`}
                        value={responses[item.key] ?? ""}
                        onChange={(e) => {
                          setError(null);
                          setResponses((prev) => ({
                            ...prev,
                            [item.key]: e.target.value,
                          }));
                        }}
                        className="text-sm resize-none"
                      />
                    ) : (
                      <Input
                        id={`resubmit-${item.key}`}
                        maxLength={2000}
                        disabled={submitting}
                        placeholder={`Enter ${item.label.toLowerCase()}...`}
                        value={responses[item.key] ?? ""}
                        onChange={(e) => {
                          setError(null);
                          setResponses((prev) => ({
                            ...prev,
                            [item.key]: e.target.value,
                          }));
                        }}
                        className="text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No additional missed requirement fields specified. Click resubmit to reopen this request for review.
            </p>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-1.5">
              {submitting && (
                <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              )}
              {submitting ? "Resubmitting..." : "Submit Missed Requirements"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
