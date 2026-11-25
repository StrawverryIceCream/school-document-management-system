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
  AUTHORIZED_PROXY_ID_NUMBER_PLACEHOLDERS,
  AUTHORIZED_PROXY_ID_TYPES,
  MAX_CLAIMANT_NAME_LENGTH,
  MAX_PROXY_ID_NUMBER_LENGTH,
  type PickupType,
  validateClaimHandoff,
} from "@/lib/requests/claim-handoff";
import { getRoleIdRequirementLabel, ROLE_META } from "@/lib/profile";
import type { UserRole } from "@/types";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface ClaimHandoffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName?: string;
  studentId?: string;
  requesterRole?: UserRole;
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
  requesterRole,
  referenceNumber = "",
  documentTitle = "",
  updating,
  onConfirm,
}: ClaimHandoffDialogProps) {
  const roleLabel = requesterRole ? ROLE_META[requesterRole].label : "Requester";
  const idLabel = getRoleIdRequirementLabel(requesterRole);
  const [pickupType, setPickupType] = useState<PickupType>("self");
  const [claimantName, setClaimantName] = useState(studentName);
  const [notes, setNotes] = useState("");
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [errors, setErrors] = useState<{
    claimantName?: string;
    idType?: string;
    idNumber?: string;
  }>({});
  const selectedIdType = AUTHORIZED_PROXY_ID_TYPES.find(
    (authorizedIdType) => authorizedIdType === idType,
  );
  const idNumberPlaceholder = selectedIdType
    ? AUTHORIZED_PROXY_ID_NUMBER_PLACEHOLDERS[selectedIdType]
    : "Enter the representative's ID number";

  const handlePickupTypeChange = (type: PickupType) => {
    setPickupType(type);
    setErrors({});
    if (type === "self") {
      setClaimantName(studentName);
      setIdType("");
      setIdNumber("");
      setNotes(
        requesterRole === "student" && studentId
          ? `${idLabel} #${studentId} presented`
          : `${idLabel} verified`,
      );
    } else {
      setClaimantName("");
      setIdType("");
      setIdNumber("");
      setNotes("");
    }
  };

  const handleConfirm = () => {
    const res = validateClaimHandoff({
      pickupType,
      claimantName,
      studentName,
      notes,
      idType,
      idNumber,
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
                <span className="text-muted-foreground">Registered {roleLabel}:</span>
                <span className="font-semibold text-foreground">
                  {studentName} {requesterRole === "student" && studentId ? `(${studentId})` : ""}
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
                <p className="text-xs font-semibold">{roleLabel} (Self)</p>
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
                  ? `${roleLabel} full name`
                  : "e.g., Maria Santos (Authorized Proxy)"
              }
              value={claimantName}
              onChange={(e) => {
                setClaimantName(e.target.value);
                if (errors.claimantName) {
                  setErrors((prev) => ({ ...prev, claimantName: undefined }));
                }
              }}
              maxLength={MAX_CLAIMANT_NAME_LENGTH}
              aria-invalid={Boolean(errors.claimantName)}
              className="text-xs"
            />
            {errors.claimantName && (
              <p className="text-[11px] text-destructive font-medium">
                {errors.claimantName}
              </p>
            )}
          </div>

          {pickupType === "proxy" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="proxy-id-type" className="text-xs font-medium">
                  ID Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={idType}
                  onValueChange={(value) => {
                    setIdType(value);
                    if (errors.idType) {
                      setErrors((prev) => ({ ...prev, idType: undefined }));
                    }
                  }}
                >
                  <SelectTrigger
                    id="proxy-id-type"
                    aria-invalid={Boolean(errors.idType)}
                    className="w-full text-xs"
                  >
                    <SelectValue placeholder="Select an ID type" />
                  </SelectTrigger>
                  <SelectContent>
                    {AUTHORIZED_PROXY_ID_TYPES.map((authorizedIdType) => (
                      <SelectItem key={authorizedIdType} value={authorizedIdType}>
                        {authorizedIdType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idType && (
                  <p className="text-[11px] text-destructive font-medium" role="alert">
                    {errors.idType}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="proxy-id-number" className="text-xs font-medium">
                  ID Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="proxy-id-number"
                  placeholder={idNumberPlaceholder}
                  value={idNumber}
                  onChange={(e) => {
                    setIdNumber(e.target.value);
                    if (errors.idNumber) {
                      setErrors((prev) => ({ ...prev, idNumber: undefined }));
                    }
                  }}
                  maxLength={MAX_PROXY_ID_NUMBER_LENGTH}
                  aria-invalid={Boolean(errors.idNumber)}
                  className="text-xs"
                />
                {errors.idNumber && (
                  <p className="text-[11px] text-destructive font-medium" role="alert">
                    {errors.idNumber}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="claimant-notes" className="text-xs font-medium">
              Verification Details & ID Remarks
            </Label>
            <Textarea
              id="claimant-notes"
              placeholder={
                pickupType === "self"
                  ? `e.g., ${idLabel} verified at counter`
                  : `e.g., Authorization letter presented with ${idLabel} & Representative National ID`
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs resize-none"
              rows={2}
            />
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
