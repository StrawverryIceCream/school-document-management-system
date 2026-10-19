import { FileText } from "lucide-react";
import type { RequestAttachment } from "@/types";

export function AttachmentLink({
  attachment,
}: {
  attachment: RequestAttachment;
}) {
  return (
    <a
      href={attachment.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <FileText className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{attachment.fileName}</span>
      {attachment.label && (
        <span className="truncate text-xs text-muted-foreground">
          ({attachment.label})
        </span>
      )}
    </a>
  );
}
