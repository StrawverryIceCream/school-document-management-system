import type { RequestStatus } from "@/types";
import { STATUS_COLORS, STATUS_LABELS } from "./requestStatus";

interface WindowRequestStatusBadgeProps {
  status: RequestStatus;
}

function WindowRequestStatusBadge({ status }: WindowRequestStatusBadgeProps) {
  return (
    <span style={{ color: STATUS_COLORS[status] ?? "var(--muted-foreground)" }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export default WindowRequestStatusBadge;