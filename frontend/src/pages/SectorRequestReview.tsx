import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, LoaderCircle, Printer } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuditTrailCard } from "@/components/windows/review/AuditTrailCard";
import { ComplianceChecklistCard } from "@/components/windows/review/ComplianceChecklistCard";
import { RegistrarReviewCard } from "@/components/windows/review/RegistrarReviewCard";
import { RequestDetailsCard } from "@/components/windows/review/RequestDetailsCard";
import { StatusChangeDialog } from "@/components/windows/review/StatusChangeDialog";
import { StudentInfoCard } from "@/components/windows/review/StudentInfoCard";
import { WindowOperationsCard } from "@/components/windows/review/WindowOperationsCard";
import { WorkflowPipelineCard } from "@/components/windows/review/WorkflowPipelineCard";
import { getOffice } from "@/lib/sectors/sectors-config";
import { updateRequestStatus } from "@/api/requests";
import { REQUEST_STATUS_CONFIG, statusStyles } from "@/lib/requests";
import { REVIEW_ACTIONS } from "@/lib/windows/review/constants";
import { fetchReviewData } from "@/lib/windows/review/fetch-review-data";
import { formatDate } from "@/lib/windows/review/format";
import type { ReviewData, ReviewField } from "@/lib/windows/review/types";
import type { RequestStatus } from "@/types";

export default function SectorRequestReview() {
  const { sectorId, divisionId, officeId, requestId } = useParams();
  const navigate = useNavigate();

  const office =
    sectorId && divisionId && officeId
      ? getOffice(sectorId, divisionId, officeId)
      : undefined;

  const [reviewData, setReviewData] = useState<{
    id: string | null;
    loading: boolean;
    error: string | null;
    data: ReviewData | null;
  }>({ id: null, loading: true, error: null, data: null });
  const [releaseDate, setReleaseDate] = useState("");
  const [releasePdfUrl, setReleasePdfUrl] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<RequestStatus | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    void fetchReviewData(requestId)
      .then((data) => {
        if (cancelled) return;
        setReviewData({ id: requestId, loading: false, error: null, data });
        setReleaseDate(data.request.releaseDate ?? "");
        setReleasePdfUrl(data.request.releasePdfUrl ?? "");
        setStaffNotes(data.request.internalNotes ?? "");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : "Could not load this request.";
        setReviewData({
          id: requestId,
          loading: false,
          error: message,
          data: null,
        });
        toast.error(message);
      });

    return () => {
      cancelled = true;
    };
  }, [requestId]);

  const backUrl = `/sectors/${sectorId}/${divisionId}/${officeId}`;

  if (!office) {
    return (
      <div className="p-6 sm:p-10">
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CircleAlert className="size-4" aria-hidden="true" />
            Invalid office route
          </div>
          <p className="mt-1">
            This review link does not identify a valid sector office.
          </p>
        </div>
      </div>
    );
  }

  const request = reviewData.data?.request ?? null;
  const loading =
    Boolean(requestId) && (reviewData.id !== requestId || reviewData.loading);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 p-8 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading request details...
      </div>
    );
  }

  if (reviewData.error || !request || !request.user) {
    return (
      <main className="space-y-5 p-6 sm:p-10">
        <Button
          variant="ghost"
          className="-ml-3 gap-2"
          onClick={() => navigate(backUrl)}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {office.code} Requests
        </Button>
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CircleAlert className="size-4" aria-hidden="true" />
            Request details unavailable
          </div>
          <p className="mt-1">
            {reviewData.error ?? "The selected request or requester could not be found."}
          </p>
        </div>
      </main>
    );
  }

  const student = request.user;
  const documentType = request.documentType;
  const statusConfig = REQUEST_STATUS_CONFIG[request.status];
  const configuredFields = documentType?.requiredFields ?? [];
  const formData = request.formData ?? {};
  const configuredKeys = new Set(configuredFields.map((f) => f.key));
  const extraFields = Object.entries(formData).filter(
    ([k]) => !configuredKeys.has(k),
  );
  const paymentRequired = Number(request.amountDue) > 0;
  const processingRequiresPayment =
    Number(documentType?.fee ?? request.amountDue) > 0;
  const hasPaymentRecord = (request.payments?.length ?? 0) > 0;
  const paymentStatus = hasPaymentRecord
    ? request.payments?.map((p) => p.status).join(", ")
    : paymentRequired
      ? "No payment submitted"
      : "Not required";
  const actions = REVIEW_ACTIONS.filter(({ status }) =>
    request.availableTransitions.includes(status),
  );
  const statusLabel = (status: RequestStatus) =>
    REQUEST_STATUS_CONFIG[status].label;

  async function confirmStatusChange() {
    if (!requestId || !pendingAction) return;
    setUpdating(true);

    try {
      await updateRequestStatus(requestId, {
        status: pendingAction,
        releaseDate: pendingAction === "ready" ? releaseDate : undefined,
        releasePdfUrl:
          pendingAction === "ready" && releasePdfUrl.trim()
            ? releasePdfUrl.trim()
            : undefined,
        staffNotes: staffNotes.trim() || null,
      });
      setPendingAction(null);
      toast.success(
        `Request marked ${statusLabel(pendingAction).toLowerCase()}.`,
      );

      const data = await fetchReviewData(requestId);
      setReviewData({ id: requestId, loading: false, error: null, data });
      setReleaseDate(data.request.releaseDate ?? "");
      setReleasePdfUrl(data.request.releasePdfUrl ?? "");
      setStaffNotes(data.request.internalNotes ?? "");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update status.",
      );
    } finally {
      setUpdating(false);
    }
  }

  const fields: ReviewField[] = [
    ...configuredFields.map((field) => ({
      key: field.key,
      label: field.label,
      value: formData[field.key],
      fileField: field.type === "file",
    })),
    ...extraFields.map(([key, value]) => ({
      key,
      label: key,
      value,
      fileField: false,
    })),
  ];

  return (
    <main className="space-y-6 p-6 sm:p-10 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 gap-2"
          onClick={() => navigate(backUrl)}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {office.code} Requests
        </Button>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tracking ID:</span>
          <span className="font-mono font-bold text-foreground">
            {request.referenceNumber}
          </span>
          <span>•</span>
          <Badge variant="outline" className="text-xs">
            {office.code} Queue
          </Badge>
        </div>
      </div>

      <Card className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Request Review: {documentType?.name ?? request.documentTypeName}
              </h1>
              <Badge
                variant="outline"
                className={`gap-1.5 rounded-full px-2.5 py-1 font-medium ${statusStyles[request.status]}`}
              >
                <statusConfig.icon className="size-3.5" aria-hidden="true" />
                {statusConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Requester:{" "}
              <span className="font-semibold text-foreground">
                {student?.fullName ?? "Unknown Requester"}
              </span>{" "}
              ({student?.department || "University Member"}) &bull; Submitted{" "}
              {formatDate(request.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 text-xs h-9"
              onClick={() => window.print()}
            >
              <Printer className="size-3.5" aria-hidden="true" />
              Print Slip
            </Button>
            {actions.map(({ status, label, icon: Icon }) => {
              const paymentBlocked =
                status === "processing" &&
                processingRequiresPayment &&
                !hasPaymentRecord;
              const releaseDateMissing = status === "ready" && !releaseDate;
              return (
                <Button
                  key={status}
                  size="sm"
                  className="gap-2 text-xs h-9"
                  disabled={updating || paymentBlocked || releaseDateMissing}
                  onClick={() => setPendingAction(status)}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <StudentInfoCard student={student} amountDue={request.amountDue} />
          <RequestDetailsCard
            request={request}
            paymentStatus={paymentStatus}
            fields={fields}
            attachments={reviewData.data?.attachments ?? []}
            attachmentsError={reviewData.data?.attachmentsError ?? null}
          />
          <ComplianceChecklistCard
            request={request}
            paymentStatus={paymentStatus}
          />
        </div>
        <div className="lg:col-span-4 space-y-6">
          <RegistrarReviewCard
            actions={actions}
            statusLabel={statusConfig.label}
            releaseDate={releaseDate}
            onReleaseDateChange={setReleaseDate}
            releasePdfUrl={releasePdfUrl}
            onReleasePdfUrlChange={setReleasePdfUrl}
            staffNotes={staffNotes}
            onStaffNotesChange={setStaffNotes}
            processingRequiresPayment={processingRequiresPayment}
            hasPaymentRecord={hasPaymentRecord}
            updating={updating}
            onSelectAction={setPendingAction}
          />
          <WorkflowPipelineCard request={request} />
          <WindowOperationsCard request={request} />
          <AuditTrailCard
            request={request}
            staffNotes={staffNotes}
            onStaffNotesChange={setStaffNotes}
          />
        </div>
      </div>

      <StatusChangeDialog
        statusLabel={pendingAction ? statusLabel(pendingAction) : null}
        updating={updating}
        onConfirm={confirmStatusChange}
        onClose={() => setPendingAction(null)}
      />
    </main>
  );
}
