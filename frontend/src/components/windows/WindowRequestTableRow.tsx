import { memo } from "react";
import { Eye } from "lucide-react";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { statusStyles } from "@/lib/request";
import {
  REQUEST_STATUS_OPTIONS,
  REQUEST_WINDOWS,
  type RequestWindow,
} from "@/lib/windows";
import type { DocumentRequestWithRelations } from "@/types";

type WindowRequestTableRowProps = {
  request: DocumentRequestWithRelations;
  windowId: RequestWindow | undefined;
  selected: boolean;
  onSelectChange: (id: string, checked: boolean) => void;
  onReview: (id: string) => void;
};

// Memoized so toggling one checkbox does not re-render every row on the page.
export const WindowRequestTableRow = memo(function WindowRequestTableRow({
  request,
  windowId,
  selected,
  onSelectChange,
  onReview,
}: WindowRequestTableRowProps) {
  const id = String(request.id);
  const requester = request.user?.fullName ?? "Unknown";
  const initials = requester
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const requestWindow = REQUEST_WINDOWS.find((item) => item.id === windowId);

  return (
    <TableRow className="align-middle">
      <TableCell className="whitespace-normal">
        <Checkbox
          aria-label={`Select request from ${requester}`}
          checked={selected}
          onCheckedChange={(checked) => onSelectChange(id, checked === true)}
        />
      </TableCell>
      <TableCell className="whitespace-normal">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
            {initials || "?"}
          </span>
          <div className="min-w-0">
            {request.user ? (
              <ProfileTrigger userId={request.user.id}>
                <button
                  type="button"
                  className="max-w-40 truncate text-left font-medium text-foreground hover:underline"
                >
                  {requester}
                </button>
              </ProfileTrigger>
            ) : (
              <span className="font-medium text-foreground">{requester}</span>
            )}
            <p className="text-xs text-muted-foreground">
              ID: {request.user?.studentId ?? "—"}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant="outline"
          className="border-transparent bg-muted text-muted-foreground font-normal capitalize"
        >
          {request.user?.role ?? "—"}
        </Badge>
      </TableCell>
      <TableCell className="max-w-52 whitespace-normal break-words">
        <p className="font-medium">
          {request.documentType?.name ?? "Unknown document"}
        </p>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {request.purpose ??
            request.documentType?.description ??
            "Document request"}
        </p>
      </TableCell>
      <TableCell className="whitespace-normal text-sm">
        {request.createdAt
          ? new Date(request.createdAt).toLocaleDateString("en-US")
          : "—"}
      </TableCell>
      <TableCell className="whitespace-normal">
        <Badge
          variant="outline"
          className={`capitalize ${statusStyles[request.status]}`}
        >
          {REQUEST_STATUS_OPTIONS.find((status) => status.id === request.status)
            ?.label ?? request.status}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-normal">
        <div className="flex items-center gap-1.5 break-words text-sm text-muted-foreground">
          <span
            aria-label={
              windowId
                ? `Window ${windowId.split("-")[1]}`
                : "College window unassigned"
            }
            className="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/70 text-xs font-semibold leading-none text-muted-foreground"
          >
            {windowId?.split("-")[1] ?? "—"}
          </span>
          {requestWindow?.label.split(" (")[0] ?? "Unassigned"}
        </div>
      </TableCell>
      <TableCell className="align-middle whitespace-normal">
        <div className="flex w-full justify-end">
          <Button
            variant="outline"
            size="sm"
            aria-label={`Review details for ${requester}`}
            className="h-auto min-w-0 gap-1 px-1.5 py-1.5 text-xs whitespace-normal"
            onClick={() => onReview(id)}
          >
            <Eye className="size-4" aria-hidden="true" />
            <span>Review Details</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
