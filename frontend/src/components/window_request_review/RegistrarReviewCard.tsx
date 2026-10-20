import { Eye } from "lucide-react";
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
import { REVIEW_ACTIONS } from "@/lib/window_request_review/constants";
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

            {actions.map(({ status, label, icon: Icon }) => {
              const paymentBlocked =
                status === "processing" &&
                processingRequiresPayment &&
                !hasPaymentRecord;
              const releaseDateMissing = status === "ready" && !releaseDate;
              return (
                <div key={status} className="space-y-1">
                  <Button
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
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No status changes are available for a {statusLabel.toLowerCase()}{" "}
            request.
          </p>
        )}

        <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
          <p className="flex items-center gap-2 font-medium">
            <Eye className="size-4" aria-hidden="true" />
            Workflow limitations
          </p>
          <p className="mt-1 text-muted-foreground">
            The current backend does not support moving requests to On Hold or
            Rejected. Those actions are unavailable here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
