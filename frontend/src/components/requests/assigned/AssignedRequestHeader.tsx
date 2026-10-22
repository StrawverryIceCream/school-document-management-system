import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";

interface AssignedRequestHeaderProps {
  totalCount: number;
}

export default function AssignedRequestHeader({
  totalCount,
}: AssignedRequestHeaderProps) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardCheck className="size-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Assigned Requests
          </h1>
          <Badge
            variant="secondary"
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
          >
            {totalCount} {totalCount === 1 ? "request" : "requests"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Review, organize, and fulfill document requests under your custody.
        </p>
      </div>
    </div>
  );
}
