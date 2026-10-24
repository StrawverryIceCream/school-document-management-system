import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { RequestStatus } from "@/types";

export function StatusChangeDialog({
  status,
  statusLabel,
  defaultClaimantName = "",
  updating,
  onConfirm,
  onClose,
}: {
  // null means the dialog is closed
  status: RequestStatus | null;
  statusLabel: string | null;
  defaultClaimantName?: string;
  updating: boolean;
  onConfirm: (details: { reason?: string; claimedBy?: string }) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [claimedBy, setClaimedBy] = useState(defaultClaimantName);

  useEffect(() => {
    if (status !== null) {
      setReason("");
      setClaimedBy(defaultClaimantName);
    }
  }, [status, defaultClaimantName]);

  const isReasonRequired = status === "rejected" || status === "cancelled";
  const canConfirm = !updating && (!isReasonRequired || Boolean(reason.trim()));

  return (
    <AlertDialog
      open={status !== null}
      onOpenChange={(open) => {
        if (!open && !updating) onClose();
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm request status change</AlertDialogTitle>
          <AlertDialogDescription>
            {statusLabel
              ? `Are you sure you want to mark this request ${statusLabel.toLowerCase()}? This will update the request and notify the requester where supported.`
              : "Confirm this request status change."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isReasonRequired && (
          <div className="space-y-2 py-2">
            <Label htmlFor="status-change-reason">
              Reason for {statusLabel?.toLowerCase()}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="status-change-reason"
              placeholder={`Please provide the reason for ${statusLabel?.toLowerCase()}...`}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        )}

        {status === "claimed" && (
          <div className="space-y-2 py-2">
            <Label htmlFor="claimant-name">Claimant Name</Label>
            <Input
              id="claimant-name"
              placeholder="Name of person claiming document"
              value={claimedBy}
              onChange={(e) => setClaimedBy(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Defaults to the student. If an authorized proxy is claiming, enter their full name.
            </p>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={updating}>Go back</AlertDialogCancel>
          <AlertDialogAction
            disabled={!canConfirm}
            onClick={() =>
              onConfirm({
                reason: reason.trim(),
                claimedBy: claimedBy.trim(),
              })
            }
          >
            {updating && (
              <LoaderCircle
                className="size-4 animate-spin mr-1"
                aria-hidden="true"
              />
            )}
            Confirm change
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
