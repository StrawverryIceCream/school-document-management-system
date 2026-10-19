import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RegistrarReviewCard } from "@/components/window_request_review/RegistrarReviewCard";
import { RequestDetailsCard } from "@/components/window_request_review/RequestDetailsCard";
import { StatusChangeDialog } from "@/components/window_request_review/StatusChangeDialog";
import { StudentInfoCard } from "@/components/window_request_review/StudentInfoCard";
import { useWindowView } from "@/hooks/useWindowView";
import { getRequestWindowForCollege } from "@/lib/windowRequests";
import { REQUEST_STATUS_CONFIG, statusStyles } from "@/lib/request";
import { REVIEW_ACTIONS } from "@/lib/window_request_review/constants";
import { fetchReviewData } from "@/lib/window_request_review/fetch-review-data";
import type {
  ReviewData,
  ReviewField,
} from "@/lib/window_request_review/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { RequestStatus } from "@/types";

function WindowRequestReview() {
  const { collegeId, requestId } = useParams();
  const navigate = useNavigate();
  const { TILES, updateRequestStatus, refreshRequests } = useWindowView();
  const [reviewData, setReviewData] = useState<{
    id: string | null;
    loading: boolean;
    error: string | null;
    data: ReviewData | null;
  }>({ id: null, loading: true, error: null, data: null });
  const [releaseDate, setReleaseDate] = useState("");
  const [staffNotes, setStaffNotes] = useState("");
  const [pendingAction, setPendingAction] = useState<RequestStatus | null>(
    null,
  );
  const [updating, setUpdating] = useState(false);

  const college = TILES.find((tile) => tile.id === collegeId);
  const request =
    reviewData.id === requestId ? reviewData.data?.request ?? null : null;
  const attachments =
    reviewData.id === requestId ? reviewData.data?.attachments ?? [] : [];
  const attachmentsError =
    reviewData.id === requestId
      ? reviewData.data?.attachmentsError ?? null
      : null;
  const loading =
    Boolean(requestId) &&
    (reviewData.id !== requestId || reviewData.loading);
  const error = reviewData.id === requestId ? reviewData.error : null;

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;

    void fetchReviewData(requestId)
      .then((data) => {
        if (cancelled) return;
        setReviewData({ id: requestId, loading: false, error: null, data });
        setReleaseDate(data.request.releaseDate ?? "");
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

  if (!collegeId || !college) {
    return (
      <div className="p-6 sm:p-10">
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CircleAlert className="size-4" aria-hidden="true" />
            Invalid college route
          </div>
          <p className="mt-1">
            This review link does not identify a registrar college.
          </p>
        </div>
      </div>
    );
  }

  if (loading || reviewData.loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 p-8 text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Loading request details...
      </div>
    );
  }

  if (error || !request) {
    return (
      <main className="space-y-5 p-6 sm:p-10">
        <Button
          variant="ghost"
          className="-ml-3 gap-2"
          onClick={() => navigate(`/windows/${collegeId}`)}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {college.title} Requests
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
            {error ?? "The selected request could not be found."}
          </p>
        </div>
      </main>
    );
  }

  const student = request.user;
  const documentType = request.documentType;
  const actualWindow = getRequestWindowForCollege(student?.college);
  const routeWindow = getRequestWindowForCollege(collegeId);

  if (!student || !actualWindow || actualWindow !== routeWindow) {
    return (
      <main className="space-y-5 p-6 sm:p-10">
        <Button
          variant="ghost"
          className="-ml-3 gap-2"
          onClick={() => navigate(`/windows/${collegeId}`)}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {college.title} Requests
        </Button>
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CircleAlert className="size-4" aria-hidden="true" />
            Request is not assigned to this college
          </div>
          <p className="mt-1">
            The selected request does not belong to the {college.title} request
            queue.
          </p>
        </div>
      </main>
    );
  }

  const statusConfig = REQUEST_STATUS_CONFIG[request.status];
  const configuredFields = documentType?.requiredFields ?? [];
  const formData = request.formData ?? {};
  const configuredKeys = new Set(configuredFields.map((field) => field.key));
  const extraFields = Object.entries(formData).filter(
    ([key]) => !configuredKeys.has(key),
  );
  const paymentRequired = Number(request.amountDue) > 0;
  const processingRequiresPayment =
    Number(documentType?.fee ?? request.amountDue) > 0;
  const hasPaymentRecord = (request.payments?.length ?? 0) > 0;
  const paymentStatus = hasPaymentRecord
    ? request.payments?.map((payment) => payment.status).join(", ")
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
      await updateRequestStatus(requestId, pendingAction, {
        releaseDate: pendingAction === "ready" ? releaseDate : undefined,
        staffNotes: staffNotes.trim() || null,
      });
      setPendingAction(null);
      toast.success(`Request marked ${statusLabel(pendingAction).toLowerCase()}.`);

      try {
        const data = await fetchReviewData(requestId);
        setReviewData({ id: requestId, loading: false, error: null, data });
        setReleaseDate(data.request.releaseDate ?? "");
        setStaffNotes(data.request.internalNotes ?? "");
        await refreshRequests();
      } catch (err) {
        toast.error(
          err instanceof Error
            ? `Status updated, but request details could not be refreshed: ${err.message}`
            : "Status updated, but request details could not be refreshed.",
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not update request status.";
      toast.error(message);
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
    <main className="space-y-6 p-6 sm:p-10">
      <header className="space-y-3">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-3 gap-2"
          onClick={() => navigate(`/windows/${collegeId}`)}
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to {college.title} Requests
        </Button>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              {college.description} Registrar Queue
            </p>
            <h1 className="text-3xl font-bold tracking-tight">
              Review {request.referenceNumber}
            </h1>
          </div>
          <Badge
            variant="outline"
            className={`gap-1.5 rounded-full px-2.5 py-1 font-medium ${statusStyles[request.status]}`}
          >
            <statusConfig.icon className="size-3.5" aria-hidden="true" />
            {statusConfig.label}
          </Badge>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(18rem,1fr)]">
        <div className="space-y-6">
          <StudentInfoCard student={student} />
          <RequestDetailsCard
            request={request}
            paymentStatus={paymentStatus}
            fields={fields}
            attachments={attachments}
            attachmentsError={attachmentsError}
          />
        </div>

        <aside className="space-y-6">
          <RegistrarReviewCard
            actions={actions}
            statusLabel={statusConfig.label}
            releaseDate={releaseDate}
            onReleaseDateChange={setReleaseDate}
            staffNotes={staffNotes}
            onStaffNotesChange={setStaffNotes}
            processingRequiresPayment={processingRequiresPayment}
            hasPaymentRecord={hasPaymentRecord}
            updating={updating}
            onSelectAction={setPendingAction}
          />

          <Card>
            <CardHeader>
              <CardTitle>Internal Notes</CardTitle>
              <CardDescription>
                Registrar-only notes currently saved on this request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {request.internalNotes || "No internal notes have been saved."}
              </p>
            </CardContent>
          </Card>
        </aside>
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

export default WindowRequestReview;
