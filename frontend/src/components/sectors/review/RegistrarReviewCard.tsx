import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { REVIEW_ACTIONS } from "@/lib/sectors/review/constants";
import type { RequestStatus } from "@/types";

const STAFF_NOTES_MAX_LENGTH = 1000;

export function RegistrarReviewCard({
  actions,
  statusLabel,
  releaseDate,
  onReleaseDateChange,
  releasePdfUrl = "",
  onReleasePdfUrlChange,
  staffNotes,
  onStaffNotesChange,
  processingRequiresPayment,
  hasPaymentRecord,
  updating,
  onSelectAction,
}: {
  actions: typeof REVIEW_ACTIONS;
  statusLabel: string;
  releaseDate: string;
  onReleaseDateChange: (value: string) => void;
  releasePdfUrl?: string;
  onReleasePdfUrlChange?: (value: string) => void;
  staffNotes: string;
  onStaffNotesChange: (value: string) => void;
  processingRequiresPayment: boolean;
  hasPaymentRecord: boolean;
  updating: boolean;
  onSelectAction: (status: RequestStatus) => void;
}) {
  const primaryActions = actions.filter(
    (a) => a.status !== "rejected" && a.status !== "cancelled",
  );
  const exceptionActions = actions.filter(
    (a) => a.status === "rejected" || a.status === "cancelled",
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Review</CardTitle>
        <CardDescription>
          Available actions follow the request status transitions accepted by
          the current status API.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.length > 0 ? (
          <>
            {actions.some((action) => action.status === "ready") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="release-date">Release date</Label>
                  <Input
                    id="release-date"
                    type="date"
                    value={releaseDate}
                    onChange={(event) =>
                      onReleaseDateChange(event.currentTarget.value)
                    }
                    aria-required="true"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required by the API before this request can be marked ready.
                  </p>
                </div>
                {onReleasePdfUrlChange && (
                  <div className="space-y-2">
                    <Label htmlFor="release-pdf-url">Digital PDF Release URL (Optional)</Label>
                    <Input
                      id="release-pdf-url"
                      type="url"
                      placeholder="https://... (Cloudinary or approved document link)"
                      value={releasePdfUrl}
                      onChange={(event) =>
                        onReleasePdfUrlChange(event.currentTarget.value)
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      If provided, student can download the official PDF from their portal.
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="staff-notes">Internal registrar note</Label>
              <Textarea
                id="staff-notes"
                value={staffNotes}
                maxLength={STAFF_NOTES_MAX_LENGTH}
                onChange={(event) =>
                  onStaffNotesChange(event.currentTarget.value)
                }
                placeholder="Add an internal note"
              />
              <p className="text-xs text-muted-foreground">
                Saved with the next status change.
              </p>
            </div>

            {primaryActions.map(({ status, label, icon: Icon, variant }) => {
              const paymentBlocked =
                status === "processing" &&
                processingRequiresPayment &&
                !hasPaymentRecord;
              const releaseDateMissing = status === "ready" && !releaseDate;
              return (
                <div key={status} className="space-y-1">
                  <Button
                    variant={variant ?? "default"}
                    className="w-full gap-2"
                    disabled={updating || paymentBlocked || releaseDateMissing}
                    onClick={() => onSelectAction(status)}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </Button>
                  {paymentBlocked && (
                    <p className="text-xs text-muted-foreground">
                      A payment record is required before processing.
                    </p>
                  )}
                  {releaseDateMissing && (
                    <p className="text-xs text-muted-foreground">
                      Select a release date to enable this action.
                    </p>
                  )}
                </div>
              );
            })}

            {exceptionActions.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Quick Terminations & Exceptions
                </span>
                <div
                  className={
                    exceptionActions.length === 2
                      ? "grid grid-cols-2 gap-2"
                      : "space-y-1"
                  }
                >
                  {exceptionActions.map(({ status, icon: Icon }) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      className="w-full gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/60"
                      disabled={updating}
                      onClick={() => onSelectAction(status)}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {status === "rejected" ? "Reject Request" : "Cancel Request"}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No status changes are available for a {statusLabel.toLowerCase()}{" "}
            request.
          </p>
        )}

      </CardContent>
    </Card>
  );
}
