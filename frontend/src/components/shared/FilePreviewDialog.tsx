import { useState } from "react";
import { Download, ExternalLink, FileText, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { resolvePreviewType } from "@/lib/sectors/review/preview";
import { cn } from "@/lib/utils";

export interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  fileUrl: string | null;
  fileName?: string;
  mimeType?: string | null;
  metaItems?: Array<{ label: string; value: string }>;
}

export function FilePreviewDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  fileUrl,
  fileName,
  mimeType,
  metaItems,
}: FilePreviewDialogProps) {
  const [imgError, setImgError] = useState(false);
  const mediaType = resolvePreviewType(fileUrl, mimeType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto gap-4 p-5">
        <DialogHeader className="gap-1.5 text-left">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              {title}
            </DialogTitle>
            {fileName && (
              <Badge variant="secondary" className="font-mono text-xs">
                {fileName}
              </Badge>
            )}
          </div>
          {subtitle && (
            <DialogDescription className="text-xs text-muted-foreground">
              {subtitle}
            </DialogDescription>
          )}

          {metaItems && metaItems.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {metaItems.map(({ label, value }) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="rounded-md border-border/80 px-2 py-0.5 text-[11px] font-normal"
                >
                  <span className="mr-1 font-semibold text-muted-foreground">
                    {label}:
                  </span>
                  <span className="font-medium text-foreground">{value}</span>
                </Badge>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* Media Preview Box */}
        <div className="my-1">
          {!fileUrl ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-center text-xs text-muted-foreground">
              <FileText className="size-8 text-muted-foreground/60" />
              <span>No document file URL provided.</span>
            </div>
          ) : mediaType === "image" && !imgError ? (
            <div className="relative flex min-h-[200px] max-h-[62vh] items-center justify-center overflow-hidden rounded-xl border bg-muted/30 p-2">
              <img
                src={fileUrl}
                alt={title}
                onError={() => setImgError(true)}
                className="max-h-[58vh] w-auto max-w-full rounded-lg object-contain shadow-xs"
              />
            </div>
          ) : mediaType === "pdf" ? (
            <div className="h-[60vh] w-full overflow-hidden rounded-xl border bg-muted/20">
              <iframe
                src={fileUrl}
                title={title}
                className="size-full border-0"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12 text-center text-muted-foreground">
              {imgError ? (
                <>
                  <ImageOff className="size-10 text-muted-foreground/60" />
                  <p className="text-xs font-medium">
                    Image could not be loaded directly. You can inspect the original link.
                  </p>
                </>
              ) : (
                <>
                  <FileText className="size-10 text-muted-foreground/60" />
                  <p className="text-xs font-medium">
                    In-situ preview is not supported for this file format.
                  </p>
                </>
              )}
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-1.5 text-xs font-medium",
                )}
              >
                <Download className="size-3.5" />
                Download / Open File
              </a>
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between items-center gap-2">
          {fileUrl ? (
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-medium",
              )}
            >
              <ExternalLink className="size-3.5" />
              Open original in new tab
            </a>
          ) : <div />}

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default FilePreviewDialog;
