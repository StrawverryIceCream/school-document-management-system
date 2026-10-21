import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import RequestStatusBadge from "@/components/shared/RequestStatusBadge";
import CopyableId from "@/components/shared/CopyableId";
import type { RequestRow } from "@/context/DashboardContext";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface RequestDetailDialogProps {
  request: RequestRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-b-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground text-right">{value ?? "—"}</span>
    </div>
  );
}

function RequestDetailDialog({
  request,
  open,
  onOpenChange,
}: RequestDetailDialogProps) {
  if (!request) return null;

  const fee = Number(request.amountDue) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle>Request Inspection</DialogTitle>
            <RequestStatusBadge status={request.status} />
          </div>
          <DialogDescription>
            Verification details for reference #{request.referenceNumber || request.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 py-1">
          <DetailRow
            label="Reference Tracking"
            value={
              <CopyableId
                id={request.referenceNumber || request.id}
                displayValue={request.referenceNumber ? `#${request.referenceNumber}` : `#${request.id}`}
                label="Copy reference"
              />
            }
          />
          <DetailRow label="Applicant" value={request.applicant} />
          {request.studentId && <DetailRow label="Student / Employee ID" value={request.studentId} />}
          <DetailRow
            label="Document Requested"
            value={
              <div className="flex flex-col items-end">
                <span>{request.document}</span>
                {request.documentTypeCode && (
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {request.documentTypeCode}
                  </span>
                )}
              </div>
            }
          />
          <DetailRow
            label="Issuing Office"
            value={
              <div className="flex items-center gap-1.5">
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-bold">
                  {request.officeCode || "OUR"}
                </Badge>
                <span>{request.officeName || request.officeCode || "Registrar"}</span>
              </div>
            }
          />
          <DetailRow label="Institutional Sector" value={request.sector || "Academic Affairs"} />
          <DetailRow
            label="Turnaround SLA"
            value={`${request.processingDays ?? 3} working days`}
          />
          <DetailRow
            label="Fee & Settlement"
            value={
              <div className="flex items-center gap-1.5">
                <span>{fee > 0 ? `₱${fee.toLocaleString()}` : "Free"}</span>
                {request.paymentMethod && (
                  <Badge variant="outline" className="capitalize text-[10px]">
                    {request.paymentMethod}
                  </Badge>
                )}
              </div>
            }
          />
          <DetailRow
            label="Submitted At"
            value={
              request.submittedAt
                ? new Date(request.submittedAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "—"
            }
          />
          {request.purpose && <DetailRow label="Purpose" value={request.purpose} />}
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/requests`}>
              <span>All Requests</span>
              <ExternalLink className="ml-1.5 size-3.5" />
            </Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RequestDetailDialog;
