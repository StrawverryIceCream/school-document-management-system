import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { RequestRow } from "@/types";

interface RequestDetailsDialogProps {
  request: RequestRow | null;
  onClose: () => void;
}

function RequestDetailsDialog({ request, onClose }: RequestDetailsDialogProps) {
  return (
    <Dialog open={Boolean(request)} onOpenChange={(isOpen) => !isOpen && onClose()}>
      {request && (
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request details</DialogTitle>
            <DialogDescription>
              Review the selected request information from the live request data source.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 p-3">
              <span className="text-muted-foreground">Request ID</span>
              <span className="font-semibold">#{request.id}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Applicant</p>
                <p className="mt-1 font-medium">{request.applicant}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">
                  {request.status}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Document</p>
                <p className="mt-1 font-medium">{request.document}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Date submitted</p>
                <p className="mt-1 font-medium">{request.submittedAt ?? "Not available"}</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">College</p>
                <p className="mt-1 font-medium">{request.college ?? "Not available"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Window</p>
                <p className="mt-1 font-medium">{request.window ?? "Not available"}</p>
              </div>
            </div>

            {request.purpose && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Purpose</p>
                <p className="mt-1 rounded-md bg-muted/40 p-3 text-foreground">
                  {request.purpose}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default RequestDetailsDialog;
