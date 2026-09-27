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
import { formatDate, statusStyles } from "@/lib/utils";
import type { RequestRow } from "@/context/DashboardContext";

interface RequestDetailDialogProps {
  request: RequestRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function RequestDetailDialog({ request, open, onOpenChange }: RequestDetailDialogProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>Review the selected request information.</DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          <DetailRow label="Request ID" value={request.id} />
          <DetailRow label="Applicant" value={request.applicant} />
          <DetailRow label="Document" value={request.document} />
          <DetailRow label="College" value={request.college} />
          <DetailRow label="Window" value={request.window} />
          <DetailRow label="Date Submitted" value={formatDate(request.submittedAt)} />
          <DetailRow label="Purpose" value={request.purpose} />
          <DetailRow
            label="Status"
            value={
              <Badge variant="outline" className={`capitalize ${statusStyles[request.status]}`}>
                {request.status}
              </Badge>
            }
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RequestDetailDialog;