import { History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/sectors/review/format";
import type { RequestReviewDetails } from "@/api/requests";

interface AuditTrailCardProps {
  request: RequestReviewDetails;
  staffNotes: string;
  onStaffNotesChange: (val: string) => void;
  onSaveNote?: () => Promise<void> | void;
  saving?: boolean;
}

export function AuditTrailCard({
  request,
  staffNotes,
  onStaffNotesChange,
  onSaveNote,
  saving,
}: AuditTrailCardProps) {
  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-bold text-foreground">
          Notes & Audit Trail
        </h2>
        <History className="size-4 text-muted-foreground" />
      </div>

      <div className="space-y-2">
        <Textarea
          placeholder="Add internal staff remark or verification note..."
          value={staffNotes}
          onChange={(e) => onStaffNotesChange(e.target.value)}
          className="min-h-17.5 text-xs bg-muted/30"
        />
        {onSaveNote && (
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onSaveNote}
              disabled={saving || !staffNotes.trim()}
              className="text-xs h-7"
            >
              {saving ? "Saving..." : "Stage Note"}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t text-xs">
        {request.internalNotes && (
          <div className="p-2.5 rounded-xl bg-muted/40 border-l-2 border-primary flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="font-semibold text-foreground">Internal Registrar Note</span>
              <span>Latest</span>
            </div>
            <p className="text-muted-foreground">{request.internalNotes}</p>
          </div>
        )}

        <div className="p-2.5 rounded-xl bg-muted/30 flex flex-col gap-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="font-semibold text-foreground">Request Intake Filed</span>
            <span>{formatDate(request.createdAt)}</span>
          </div>
          <p className="text-muted-foreground">
            Request submitted by student {request.user?.fullName} via online intake portal.
          </p>
        </div>
      </div>
    </Card>
  );
}
