import { Download, TrendingUp } from "lucide-react";
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
        size="lg"
        className="bg-teal-900 text-white hover:bg-teal-900/90"
        onClick={() => onClaimSlip(request.id)}
        aria-label={`Download claim slip for ${request.documentName}`}
      >
        <Download className="size-4" aria-hidden="true" />
        Claim Slip
      </Button>
    );
  }

  return (
    <Button
      size="lg"
      variant="default"
      onClick={() => onTrackTimeline(request.id)}
      aria-label={`Track timeline for ${request.documentName}`}
      className="text-base"
    >
      Track Timeline
      <TrendingUp className="size-4" aria-hidden="true" />
    </Button>
  );
}

export default RequestActionButton;
