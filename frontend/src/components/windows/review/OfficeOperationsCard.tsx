import { useEffect, useState, use } from "react";
import { Building2, Calendar, Check, Copy, UserCheck, UserX } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/windows/review/format";
import { assignRequest, getOfficeStaff } from "@/api/requests";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "sonner";
import type { RequestReviewDetails } from "@/api/requests";

export interface OfficeOperationsCardProps {
  request: RequestReviewDetails;
}

export function OfficeOperationsCard({ request }: OfficeOperationsCardProps) {
  const authContext = use(AuthContext);
  const [prevAssignee, setPrevAssignee] = useState(request.assignee);
  const [currentAssignee, setCurrentAssignee] = useState(request.assignee ?? null);
  const [staffMembers, setStaffMembers] = useState<
    Array<{ id: string; fullName: string; role: string }>
  >([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  if (request.assignee !== prevAssignee) {
    setPrevAssignee(request.assignee);
    setCurrentAssignee(request.assignee ?? null);
  }

  useEffect(() => {
    const officeKey =
      request.documentType?.officeId || request.documentType?.office;
    if (!officeKey) return;

    let mounted = true;
    void getOfficeStaff(officeKey)
      .then((staff) => {
        if (mounted) setStaffMembers(staff);
      })
      .catch((err) => {
        console.warn("Could not load office staff for assignment:", err);
      });

    return () => {
      mounted = false;
    };
  }, [request.documentType?.officeId, request.documentType?.office]);

  const handleAssign = async (targetUserId: string | null) => {
    setIsAssigning(true);
    try {
      const updated = await assignRequest(request.id, targetUserId);
      setCurrentAssignee(updated.assignee ?? null);
      toast.success(
        targetUserId
          ? `Request delegated to ${updated.assignee?.fullName ?? "staff"}`
          : "Request unassigned",
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update assignment",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  const claimUrl = `${window.location.origin}/requests/claim?ref=${encodeURIComponent(
    request.referenceNumber,
  )}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(claimUrl);
      setHasCopied(true);
      toast.success("Claiming link copied to clipboard");
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error("Failed to copy claiming link");
    }
  };

  const officeDisplayName =
    request.documentType?.officeRecord?.name ||
    (typeof request.documentType?.office === "string" ? request.documentType.office.toUpperCase() : null) ||
    request.window?.office ||
    "Designated Office";

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-bold text-foreground">
          Office Operations
        </h2>
        <Building2 className="size-4 text-muted-foreground" />
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Processing Office
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {officeDisplayName}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Target Estimated Release
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {request.releaseDate
                ? formatDate(request.releaseDate)
                : `${request.turnaroundDays} business days upon clearance`}
            </span>
          </div>
          <Calendar className="size-4 text-muted-foreground" />
        </div>

        {/* Staff Delegation & Assignee */}
        <div className="p-3 rounded-xl bg-muted/30 border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Staff
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                currentAssignee
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentAssignee ? currentAssignee.fullName : "Unassigned"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {authContext?.user && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1 cursor-pointer"
                disabled={isAssigning || currentAssignee?.id === authContext.user.id}
                onClick={() => handleAssign(authContext.user!.id)}
              >
                <UserCheck className="size-3" />
                Assign to me
              </Button>
            )}

            {staffMembers.length > 0 && (
              <select
                aria-label="Delegate request to office colleague"
                className="h-7 rounded-md border border-input bg-background px-2 text-[11px] focus:outline-none focus:ring-1 focus:ring-ring"
                value={currentAssignee?.id ?? ""}
                disabled={isAssigning}
                onChange={(e) => handleAssign(e.target.value || null)}
              >
                <option value="">-- Delegate to colleague --</option>
                {staffMembers.map((staff) => (
                  <option key={staff.id} value={staff.id}>
                    {staff.fullName} ({staff.role})
                  </option>
                ))}
              </select>
            )}

            {currentAssignee && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-destructive hover:text-destructive gap-1 px-2 cursor-pointer"
                disabled={isAssigning}
                onClick={() => handleAssign(null)}
              >
                <UserX className="size-3" />
                Unassign
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Live QR Voucher Code Box */}
      <div className="p-4 rounded-xl bg-muted/30 border flex flex-col items-center justify-center text-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Office Claiming Code
        </span>
        <span className="text-sm font-mono font-bold tracking-wider text-foreground">
          {request.referenceNumber}
        </span>

        <div className="rounded-xl border bg-white p-3 shadow-xs my-1">
          <QRCodeSVG
            value={claimUrl}
            size={160}
            level="H"
            includeMargin={false}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 text-[11px] gap-1.5 cursor-pointer mt-1"
          onClick={handleCopyLink}
        >
          {hasCopied ? (
            <>
              <Check className="size-3 text-emerald-600" />
              <span>Link Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy Claim Link</span>
            </>
          )}
        </Button>

        <span className="text-[11px] text-muted-foreground mt-1 max-w-[260px]">
          Scan with barcode scanner or visit claim verification terminal during document release.
        </span>
      </div>
    </Card>
  );
}

export const WindowOperationsCard = OfficeOperationsCard;
