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

export function StatusChangeDialog({
  statusLabel,
  updating,
  onConfirm,
  onClose,
}: {
  // null means the dialog is closed
  statusLabel: string | null;
  updating: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog
      open={statusLabel !== null}
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
        <AlertDialogFooter>
          <AlertDialogCancel disabled={updating}>Go back</AlertDialogCancel>
          <AlertDialogAction disabled={updating} onClick={onConfirm}>
            {updating && (
              <LoaderCircle
                className="size-4 animate-spin"
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
