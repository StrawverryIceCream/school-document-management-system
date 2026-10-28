import { useState } from "react";
import { LoaderCircle, ShieldCheck, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  type PickupType,
  validateClaimHandoff,
} from "@/lib/requests/claim-handoff";
import { cn } from "@/lib/utils";

export interface ClaimHandoffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  studentId?: string;
  referenceNumber?: string;
  documentTitle?: string;
  updating: boolean;
  onConfirm: (details: { claimedBy: string; reason: string }) => void;
}

export function ClaimHandoffDialog({
  open,
  onOpenChange,
  studentName = "",
  studentId = "",
  referenceNumber = "",
  documentTitle = "",
  updating,
  onConfirm,
}: ClaimHandoffDialogProps) {
  const [pickupType, setPickupType] = useState<PickupType>("self");
  const [claimantName, setClaimantName] = useState(studentName);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<{ claimantName?: string; notes?: string }>({});

  const handlePickupTypeChange = (type: PickupType) => {
    setPickupType(type);
    setErrors({});
    if (type === "self") {
      setClaimantName(studentName);
      setNotes(studentId ? `Student ID #${studentId} presented` : "Student ID verified");
    } else {
      setClaimantName("");
      setNotes("");
    }
  };

  const handleConfirm = () => {
    const res = validateClaimHandoff({
      pickupType,
      claimantName,
      studentName,
      notes,
    });

    if (!res.valid) {
      setErrors(res.errors);
      return;
    }

    if (res.data) {
      onConfirm({
        claimedBy: res.data.claimedBy,
        reason: res.data.remarks,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-6">
        <DialogHeader className="space-y-1.5 text-left border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Document Counter Release & Hand-Off
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verify recipient custody before releasing physical document credential.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {referenceNumber && (
          <div className="bg-muted/30 rounded-xl p-3 border text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reference:</span>
              <span className="font-mono font-bold text-foreground">{referenceNumber}</span>
            </div>
            {documentTitle && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Document:</span>
                <span className="font-medium text-foreground">{documentTitle}</span>
              </div>
            )}
            {studentName && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Registered Student:</span>
                <span className="font-semibold text-foreground">
                  {studentName} {studentId ? `(${studentId})` : ""}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pickup Type Selector */}
        <div className="space-y-2 pt-1">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Recipient Custody Mode <span className="text-destructive">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handlePickupTypeChange("self")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer",
                pickupType === "self"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                  : "border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <User className="size-4 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Student (Self)</p>
                <p className="text-[10px] opacity-80">Claimed in person</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handlePickupTypeChange("proxy")}
              className={cn(
                "flex items-center gap-2 p-3 rounded-xl border text-left transition-all cursor-pointer",
                pickupType === "proxy"
                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                  : "border-border/70 hover:bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="size-4 shrink-0" />
              <div>
                <p className="text-xs font-semibold">Authorized Proxy</p>
                <p className="text-[10px] opacity-80">Representative with ID</p>
              </div>
            </button>
          </div>
        </div>

        {/* Recipient Details Form */}
        <div className="space-y-3.5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="claimant-full-name" className="text-xs font-medium">
              {pickupType === "self" ? "Claimant Name" : "Representative Full Name"}{" "}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="claimant-full-name"
              placeholder={
                pickupType === "self"
                  ? "Student full name"
                  : "e.g., Maria Santos (Mother / Proxy)"
              }
              value={claimantName}
              onChange={(e) => {
                setClaimantName(e.target.value);
                if (errors.claimantName) {
                  setErrors((prev) => ({ ...prev, claimantName: undefined }));
                }
              }}
              className="text-xs"
            />
            {errors.claimantName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.claimantName}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="claimant-notes" className="text-xs font-medium">
              Verification Details & ID Remarks{" "}
              {pickupType === "proxy" && <span className="text-destructive">*</span>}
            </Label>
            <Textarea
              id="claimant-notes"
              placeholder={
                pickupType === "self"
                  ? "e.g., Student ID #2023-01456 verified at counter"
                  : "e.g., Authorization letter presented with Student ID & Representative National ID #1234-5678"
              }
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (errors.notes) {
                  setErrors((prev) => ({ ...prev, notes: undefined }));
                }
              }}
              className="text-xs resize-none"
              rows={2}
            />
            {errors.notes && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.notes}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between gap-2 pt-2 border-t">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={updating}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={updating}
            onClick={handleConfirm}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
          >
            {updating && (
              <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" />
            )}
            Confirm Release & Hand-Off
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ClaimHandoffDialog;
