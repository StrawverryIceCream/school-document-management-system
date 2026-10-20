import type React from "react";
import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS_CONFIG } from "@/lib/requests";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "@/types";

export interface RequestStatusBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "children"> {
  status: RequestStatus | string;
}

export default function RequestStatusBadge({
  className,
  status,
  ...props
}: RequestStatusBadgeProps) {
  const config = REQUEST_STATUS_CONFIG[status as RequestStatus];
  if (!config) {
    return (
      <Badge
        variant="outline"
        className={cn("capitalize font-normal text-muted-foreground", className)}
        {...props}
      >
        {status}
      </Badge>
    );
  }

  const { label, badgeClassName, dotClassName } = config;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        badgeClassName,
        className,
      )}
      {...props}
    >
      <span
        className={cn("size-1.5 rounded-full shrink-0", dotClassName)}
        aria-hidden="true"
      />
      {label}
    </Badge>
  );
}
