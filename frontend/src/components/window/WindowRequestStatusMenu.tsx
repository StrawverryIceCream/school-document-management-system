import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { RequestStatus } from "@/types";
import { STATUS_LABELS } from "@/components/window/requestStatus";

interface WindowRequestStatusMenuProps {
  requestId: string;
  onSelectStatus: (requestId: string, status: RequestStatus) => void;
}

function WindowRequestStatusMenu({ requestId, onSelectStatus }: WindowRequestStatusMenuProps) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVertical style={{ height: "1rem", width: "1rem" }} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(STATUS_LABELS).map(([value, label]) => (
            <DropdownMenuItem
              key={value}
              onClick={() => onSelectStatus(requestId, value as RequestStatus)}
            >
              Mark as {label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default WindowRequestStatusMenu;