import { QRCodeSVG } from "qrcode.react";
import { Printer, Calendar, FileText, User, Hash, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import type { MyRequestWithDocumentName } from "@/context/MyRequestContext";

interface ClaimSlipDialogProps {
  request: MyRequestWithDocumentName | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClaimSlipDialog({
  request,
  open,
  onOpenChange,
}: ClaimSlipDialogProps) {
  const { user } = useAuth();

  if (!request) return null;

  const claimUrl = `${window.location.origin}/requests/claim?ref=${encodeURIComponent(
    request.referenceNumber,
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-6">
        <DialogHeader className="text-center sm:text-left space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1.5 py-1">
              <CheckCircle2 className="size-3.5" /> Ready for Claiming
            </Badge>
            <span className="text-xs font-mono text-muted-foreground">ARCH System</span>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Official Document Claim Slip
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Present this QR slip at the releasing window along with a valid ID.
          </DialogDescription>
        </DialogHeader>

        {/* Printable claim voucher card */}
        <div className="my-2 rounded-xl border bg-card p-5 shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
          {/* Centered QR code */}
          <div className="flex flex-col items-center justify-center space-y-2 py-2">
            <div className="rounded-xl border bg-white p-3 shadow-xs">
              <QRCodeSVG
                value={claimUrl}
                size={170}
                level="H"
                includeMargin={false}
              />
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Reference Number</span>
              <p className="font-mono text-lg font-bold tracking-widest text-foreground">
                {request.referenceNumber}
              </p>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <FileText className="size-4" /> Document
              </span>
              <span className="font-medium text-right max-w-[220px] truncate">
                {request.documentName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Hash className="size-4" /> Quantity
              </span>
              <span className="font-medium">
                {request.copies} {request.copies === 1 ? "copy" : "copies"}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <User className="size-4" /> Requester
              </span>
              <span className="font-medium">
                {user?.fullName || "Student"}
              </span>
            </div>

            {user?.studentId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Hash className="size-4" /> Student ID
                </span>
                <span className="font-mono text-xs font-medium">
                  {user.studentId}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-4" /> Release Date
              </span>
              <span className="font-medium">
                {request.releaseDate
                  ? new Date(request.releaseDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Immediate"}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-end gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial gap-1.5"
          >
            <Printer className="size-4" />
            Print Slip
          </Button>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-initial"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export default ClaimSlipDialog;
