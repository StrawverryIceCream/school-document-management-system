import { Dialog, DialogContent } from "@/components/ui/dialog";

import RequestDetailsField from "./RequestDetailsField";
import RequestDetailsHeader from "./RequestDetailsHeader";
import type { RequestRow } from "@/context/DashboardContext";

interface RequestDetailsDialogProps {
  request: RequestRow | null;
  onClose: () => void;
}

function RequestDetailsDialog({ request, onClose }: RequestDetailsDialogProps) {
  return (
    <Dialog
      open={Boolean(request)}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      {request && (
        <DialogContent className="sm:max-w-lg">
          <RequestDetailsHeader />

          <div className="space-y-4 pt-2 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/40 p-3">
              <span className="text-muted-foreground">Request ID</span>
              <span className="font-semibold">#{request.id}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <RequestDetailsField
                label="Applicant"
                value={request.applicant}
              />
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Status
                </p>
                <p className="mt-1 inline-flex rounded-full bg-muted px-2 py-1 text-xs font-medium capitalize">
                  {request.status}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <RequestDetailsField label="Document" value={request.document} />
              <RequestDetailsField
                label="Date submitted"
                value={request.submittedAt ?? "Not available"}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <RequestDetailsField
                label="Office"
                value={request.officeName || request.officeCode || "Not available"}
              />
              <RequestDetailsField
                label="Course / Program"
                value={request.course ?? "Not available"}
              />
            </div>

            {request.purpose && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Purpose
                </p>
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
