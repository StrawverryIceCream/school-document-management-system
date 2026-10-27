import { QrCode, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";

type RequestActionButtonProps = {
  request: MyRequestWithDocumentName;
  onTrackTimeline: (requestId: string) => void;
  onClaimSlip: (requestId: string) => void;
};

function RequestActionButton({
  request,
  onTrackTimeline,
  onClaimSlip,
}: RequestActionButtonProps) {
  if (request.status === "ready") {
    return (
      <Button
        size="sm"
        className="bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer gap-1.5 font-semibold text-xs"
        onClick={() => onClaimSlip(request.id)}
        aria-label={`Present claim slip for ${request.documentName}`}
      >
        <QrCode className="size-3.5" aria-hidden="true" />
        Claim Slip
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onTrackTimeline(request.id)}
      aria-label={`Track timeline for ${request.documentName}`}
      className="cursor-pointer gap-1.5 font-semibold text-xs"
    >
      <TrendingUp className="size-3.5" aria-hidden="true" />
      Track Timeline
    </Button>
  );
}

export default RequestActionButton;

