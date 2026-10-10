import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS_CONFIG } from "@/lib/request";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types";

type RequestStatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "children"> & {
  status: RequestStatus;
};

function RequestStatusBadge({ className, status, ...props }: RequestStatusBadgeProps) {
  const { label, badgeClassName, dotClassName } = REQUEST_STATUS_CONFIG[status];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-2 rounded-full px-3 py-1 text-xs font-semibold",
        badgeClassName,
        className,
      )}
      {...props}
    >
      <span className={cn("size-2 rounded-full", dotClassName)} aria-hidden="true" />
      {label}
    </Badge>
  );
}

export default RequestStatusBadge;