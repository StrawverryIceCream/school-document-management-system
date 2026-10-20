// frontend/src/components/new_request/fields/FileField.tsx
import { useRef, useState } from "react";
import { CheckCircle2, FileText, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { BaseFieldProps } from "./types";

interface FileFieldProps extends BaseFieldProps<string> {
  accept?: string;
  maxSizeMb?: number;
}

export function FileField({
  id,
  label,
  required,
  value,
  onChange,
  helperText = "PDF or JPEG, max 5 MB",
  error,
  disabled,
  accept = ".pdf,.jpg,.jpeg,.png",
}: FileFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileDetails, setFileDetails] = useState<{
    name: string;
    size: string;
  } | null>(() => (value ? { name: String(value), size: "Attached" } : null));

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      setFileDetails({ name: file.name, size: sizeStr });
      onChange(file.name);
    }
  }

  function handleRemove() {
    setFileDetails(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm font-semibold">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {fileDetails && (
          <Badge variant="secondary" className={cn(BADGE_BASE, TONES.emerald.badge)}>
            <CheckCircle2 className="size-3 mr-1" />
            1 Document Attached
          </Badge>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        disabled={disabled}
        onChange={handleFileSelected}
        className="hidden"
      />

      {!fileDetails ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "rounded-xl border border-dashed border-border bg-muted/30 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/60 transition-colors group",
            disabled && "pointer-events-none opacity-50",
          )}
        >
          <div className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
            <UploadCloud className="size-5" />
          </div>
          <span className="text-sm font-semibold text-foreground">
            Click to upload or drag & drop
          </span>
          <span className="text-xs text-muted-foreground mt-1 max-w-sm">
            {helperText}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 text-xs"
            disabled={disabled}
          >
            Browse Local Files
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
              <FileText className="size-5" />
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate max-w-xs sm:max-w-md">
                {fileDetails.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {fileDetails.size} • Attached for Registrar review
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive transition-colors"
              onClick={handleRemove}
              disabled={disabled}
              title="Remove file"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
