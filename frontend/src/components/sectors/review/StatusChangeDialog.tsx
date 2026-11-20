import { useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  REJECTION_REASON_PRESETS,
  CANCELLATION_REASON_PRESETS,
} from "@/lib/sectors/review/constants";
import type { MissedRequirement, RequestStatus } from "@/types";

type DraftMissedItem = {
  id: string;
  label: string;
  type: MissedRequirement["type"];
  required: boolean;
};

const MAX_MISSED_ITEMS = 10;

function createDraftItem(): DraftMissedItem {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  return { id, label: "", type: "file", required: true };
}

function buildMissedRequirements(
  items: readonly DraftMissedItem[],
): MissedRequirement[] {
  const usedKeys = new Set<string>();
  return items.map((item, idx) => {
    const cleanLabel = item.label.trim();
    const base =
      cleanLabel
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48) || `item-${idx + 1}`;
    let key = base;
    let suffix = 2;
    while (usedKeys.has(key)) {
      key = `${base}-${suffix}`;
      suffix += 1;
    }
    usedKeys.add(key);
    return {
      key,
      label: cleanLabel,
      type: item.type,
      required: item.required,
    };
  });
}

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
  onConfirm: (details: {
    reason?: string;
    claimedBy?: string;
    resubmissionAllowed?: boolean;
    missedRequirements?: MissedRequirement[];
  }) => void;
  onClose: () => void;
}) {
  const [prevStatus, setPrevStatus] = useState(status);
  const [reason, setReason] = useState("");
  const [claimedBy, setClaimedBy] = useState(defaultClaimantName);
  const [allowResubmission, setAllowResubmission] = useState(false);
  const [missedItems, setMissedItems] = useState<DraftMissedItem[]>([]);

  if (status !== prevStatus) {
    setPrevStatus(status);
    if (status !== null) {
      setReason("");
      setClaimedBy(defaultClaimantName);
      setAllowResubmission(false);
      setMissedItems([]);
    }
  }

  const isReasonRequired = status === "rejected" || status === "cancelled";
  const allMissedItemsLabeled =
    missedItems.length > 0 &&
    missedItems.every((item) => item.label.trim().length > 0);
  const missedValid =
    status !== "rejected" || !allowResubmission || allMissedItemsLabeled;
  const canConfirm =
    !updating && (!isReasonRequired || Boolean(reason.trim())) && missedValid;

  const presets =
    status === "rejected"
      ? REJECTION_REASON_PRESETS
      : status === "cancelled"
        ? CANCELLATION_REASON_PRESETS
        : [];

  function handleToggleResubmission(checked: boolean) {
    setAllowResubmission(checked);
    if (checked && missedItems.length === 0) {
      setMissedItems([createDraftItem()]);
    }
  }

  function handleUpdateItem(
    id: string,
    patch: Partial<Omit<DraftMissedItem, "id">>,
  ) {
    setMissedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function handleRemoveItem(id: string) {
    setMissedItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <AlertDialog
      open={status !== null}
      onOpenChange={(open) => {
        if (!open && !updating) onClose();
      }}
    >
      <AlertDialogContent
        size={status === "rejected" ? "default" : "sm"}
        className={
          status === "rejected"
            ? "sm:max-w-lg max-h-[85vh] overflow-y-auto"
            : undefined
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm request status change</AlertDialogTitle>
          <AlertDialogDescription>
            {statusLabel
              ? `Are you sure you want to mark this request ${statusLabel.toLowerCase()}? This will update the request and notify the requester where supported.`
              : "Confirm this request status change."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isReasonRequired && (
          <div className="space-y-3 py-2">
            <Label htmlFor="status-change-reason">
              Reason for {statusLabel?.toLowerCase()}{" "}
              <span className="text-destructive">*</span>
            </Label>

            {presets.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium">
                  Quick options (click to insert):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {presets.map((preset) => {
                    const isSelected = reason === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setReason(preset)}
                        className={cn(
                          "rounded-md border px-2.5 py-1 text-xs text-left transition-colors cursor-pointer",
                          isSelected
                            ? "border-destructive/60 bg-destructive/15 text-destructive font-medium shadow-xs"
                            : "border-border/70 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Textarea
              id="status-change-reason"
              placeholder={`Enter reason for ${statusLabel?.toLowerCase()} or choose a quick option above...`}
              value={reason}
              maxLength={1000}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none text-sm"
              rows={3}
            />
          </div>
        )}

        {status === "rejected" && (
          <div className="space-y-3 rounded-xl border bg-muted/30 p-3.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <Checkbox
                id="allow-resubmission"
                checked={allowResubmission}
                onCheckedChange={(val) => handleToggleResubmission(val === true)}
                disabled={updating}
                className="mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-foreground block">
                  Allow requester to resubmit with Missed Requirements
                </span>
                <span className="text-xs text-muted-foreground block">
                  Reopens this same request once the requester provides the missed items below.
                </span>
              </div>
            </label>

            {allowResubmission && (
              <div className="space-y-2.5 pt-2 border-t">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Missed Requirements ({missedItems.length}/{MAX_MISSED_ITEMS})
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={updating || missedItems.length >= MAX_MISSED_ITEMS}
                    onClick={() =>
                      setMissedItems((prev) => [...prev, createDraftItem()])
                    }
                    className="h-7 gap-1 px-2.5 text-xs"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Add Missed Requirement
                  </Button>
                </div>

                {missedItems.length === 0 ? (
                  <p className="text-xs text-destructive">
                    Add at least one missed requirement item.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {missedItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_130px_auto] items-center gap-2 rounded-lg border bg-background p-2.5"
                      >
                        <Input
                          aria-label={`Missed requirement ${idx + 1} label`}
                          placeholder="e.g., Clear ID photo or Registrar clearance slip"
                          value={item.label}
                          maxLength={120}
                          disabled={updating}
                          onChange={(e) =>
                            handleUpdateItem(item.id, { label: e.target.value })
                          }
                          className="h-8 text-xs"
                        />
                        <Select
                          value={item.type}
                          disabled={updating}
                          onValueChange={(val) =>
                            handleUpdateItem(item.id, {
                              type: val as MissedRequirement["type"],
                            })
                          }
                        >
                          <SelectTrigger
                            aria-label={`Missed requirement ${idx + 1} type`}
                            className="h-8 text-xs"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="file">File Upload</SelectItem>
                            <SelectItem value="text">Short Text</SelectItem>
                            <SelectItem value="textarea">Detailed Text</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="flex items-center justify-between sm:justify-end gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                            <Checkbox
                              checked={item.required}
                              disabled={updating}
                              onCheckedChange={(val) =>
                                handleUpdateItem(item.id, {
                                  required: val === true,
                                })
                              }
                            />
                            Req
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={updating}
                            aria-label={`Remove missed requirement ${idx + 1}`}
                            onClick={() => handleRemoveItem(item.id)}
                            className="size-7 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
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
            onClick={(e) => {
              e.preventDefault();
              onConfirm({
                reason: reason.trim(),
                claimedBy: claimedBy.trim(),
                ...(status === "rejected"
                  ? {
                      resubmissionAllowed: allowResubmission,
                      missedRequirements: allowResubmission
                        ? buildMissedRequirements(missedItems)
                        : [],
                    }
                  : {}),
              });
            }}
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
