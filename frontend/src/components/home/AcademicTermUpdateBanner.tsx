import { useEffect, useState, useCallback } from "react";
import { AlertTriangle, Clock, RefreshCw, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from "@/provider/SystemSettingsProvider";
import { getMyAccountUpdate } from "@/api/accountUpdates";
import { needsAcademicTermVerification } from "@/lib/term-standing";
import type { AccountUpdateRequest } from "@/types";
import AcademicTermUpdateDialog from "./AcademicTermUpdateDialog";

interface AcademicTermUpdateBannerProps {
  className?: string;
  onVerifiedChange?: () => void;
}

export default function AcademicTermUpdateBanner({
  className = "",
  onVerifiedChange,
}: AcademicTermUpdateBannerProps) {
  const { user } = useAuth();
  const { activeAcademicTerm } = useSystemSettings();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<AccountUpdateRequest | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const isStudent = user?.role === "student";
  const isAlumni = user?.studentStatus === "alumni";
  const needsVerification = needsAcademicTermVerification(
    user,
    activeAcademicTerm,
  );

  const fetchStatus = useCallback(async () => {
    if (!isStudent || isAlumni) {
      setLoading(false);
      return;
    }
    try {
      const res = await getMyAccountUpdate();
      setLatestUpdate(res.updateRequest);
    } catch (err) {
      console.warn("Failed to fetch latest academic update status:", err);
    } finally {
      setLoading(false);
    }
  }, [isStudent, isAlumni]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  function handleSuccess() {
    fetchStatus();
    onVerifiedChange?.();
  }

  // Non-students and alumni students are never gated
  if (!isStudent || isAlumni) {
    return null;
  }

  // If already verified for active term and no pending/rejected record to display
  if (!needsVerification && (!latestUpdate || latestUpdate.status === "approved")) {
    return null;
  }

  if (loading) {
    return null;
  }

  // State 1: Pending review
  if (latestUpdate?.status === "pending") {
    return (
      <div
        className={`rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-200 ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Clock className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm">
                  Academic Term Verification Pending Review
                </span>
                <Badge
                  variant="outline"
                  className="border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs"
                >
                  {latestUpdate.academicTerm}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-amber-800 dark:text-amber-300/80 leading-relaxed">
                Your Certificate of Registration (COR) proof{" "}
                <strong className="font-mono">({latestUpdate.proofFileName})</strong>{" "}
                is awaiting evaluation by the Office of the University Registrar.
                Submitted standing:{" "}
                <span className="font-medium">
                  {latestUpdate.requestedStudentStatus === "alumni"
                    ? "Alumni"
                    : `${latestUpdate.requestedYearLevel ?? "?"}th Year • ${latestUpdate.requestedSection || "No Section"}`}
                </span>
                .
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-amber-500/30 text-xs shrink-0 self-end sm:self-center"
            onClick={fetchStatus}
          >
            <RefreshCw className="size-3.5 mr-1" />
            Refresh Status
          </Button>
        </div>
      </div>
    );
  }

  // State 2: Rejected
  if (latestUpdate?.status === "rejected") {
    return (
      <>
        <div
          className={`rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive ${className}`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <XCircle className="size-5 shrink-0 mt-0.5 text-destructive" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm">
                    Verification Rejected for {latestUpdate.academicTerm}
                  </span>
                  <Badge variant="destructive" className="text-xs">
                    Action Required
                  </Badge>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-destructive/90">
                  <strong className="font-medium">Registrar Reason:</strong>{" "}
                  {latestUpdate.rejectionReason || "Proof document was not accepted."}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="text-xs shrink-0 self-end sm:self-center"
              onClick={() => setDialogOpen(true)}
            >
              Resubmit Verification
            </Button>
          </div>
        </div>

        <AcademicTermUpdateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          activeAcademicTerm={activeAcademicTerm}
          onSuccess={handleSuccess}
        />
      </>
    );
  }

  // State 3: Unverified (requires initial submission)
  return (
    <>
      <div
        className={`rounded-xl border border-primary/30 bg-primary/10 p-4 text-primary dark:text-primary-foreground ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-foreground">
                  Academic Standing Verification Required
                </span>
                <Badge className="text-xs bg-primary text-primary-foreground">
                  {activeAcademicTerm}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Please verify your enrollment standing with your Certificate of Registration (COR)
                before submitting new document requests.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="text-xs shrink-0 self-end sm:self-center"
            onClick={() => setDialogOpen(true)}
          >
            Verify Academic Term
          </Button>
        </div>
      </div>

      <AcademicTermUpdateDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activeAcademicTerm={activeAcademicTerm}
        onSuccess={handleSuccess}
      />
    </>
  );
}
