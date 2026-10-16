import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Eye,
  FileText,
  LoaderCircle,
  PackageCheck,
  Pause,
  Play,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { getAllRequestAttachments } from "@/api/requestStatusAttachments";
import { getRequestById } from "@/api/requests";
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
import { Badge } from "@/components/ui/badge";
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
import { useWindowView } from "@/hooks/useWindowView";
import { getRequestWindowForCollege } from "@/lib/windowRequests";
import { REQUEST_STATUS_CONFIG, statusStyles } from "@/lib/request";
import type {
  RequestAttachment,
  RequestStatus,
} from "@/types";
import type { RequestReviewDetails } from "@/api/requests";

const REVIEW_ACTIONS: {
  status: RequestStatus;
  label: string;
  icon: LucideIcon;
}[] = [
  { status: "processing", label: "Start or resume processing", icon: Play },
  { status: "on_hold", label: "Place on hold", icon: Pause },
  { status: "rejected", label: "Reject request", icon: XCircle },
  { status: "ready", label: "Mark ready", icon: CheckCircle2 },
  { status: "claimed", label: "Mark claimed", icon: PackageCheck },
];

interface ReviewData {
  request: RequestReviewDetails;
  attachments: RequestAttachment[];
  attachmentsError: string | null;
}

async function fetchReviewData(requestId: string): Promise<ReviewData> {
  const request = await getRequestById(requestId);
  let attachments: RequestAttachment[] = [];
  let attachmentsError: string | null = null;

  try {
    const response = await getAllRequestAttachments({
      requestId,
      limit: 100,
    });
    attachments = response.data;
  } catch (err) {
    attachmentsError =
      err instanceof Error ? err.message : "Could not load supporting files.";
  }

  return { request, attachments, attachmentsError };
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => displayValue(item)).join(", ");
  }
  return JSON.stringify(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Not available";
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value,
  );
  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
}

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
  const initials = student.fullName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

  const fields = [
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
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>
                Student details supplied by the registrar request API.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground"
                  aria-label={`Avatar for ${student.fullName}`}
                >
                  {initials || "?"}
                </div>
                <div className="grid min-w-0 flex-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                  <Info label="Full name" value={student.fullName} />
                  <Info label="TUP / Student ID" value={student.studentId} />
                  <Info label="College" value={student.college?.name} />
                  <Info label="Department" value={student.department} />
                  <Info label="Email address" value={student.email} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Submitted information and document configuration for this
                request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                <Info
                  label="Document type"
                  value={documentType?.name ?? request.documentTypeName}
                />
                <Info label="Submitted" value={formatDate(request.createdAt)} />
                <Info label="Purpose" value={request.purpose} />
                <Info label="Number of copies" value={request.copies} />
                <Info
                  label="Amount due"
                  value={`₱${Number(request.amountDue).toFixed(2)}`}
                />
                <Info label="Payment status" value={paymentStatus} />
                <Info
                  label="Turnaround"
                  value={`${request.turnaroundDays} days`}
                />
                {request.releaseDate && (
                  <Info
                    label="Release date"
                    value={formatDate(request.releaseDate)}
                  />
                )}
                {request.claimedAt && (
                  <Info
                    label="Claimed"
                    value={formatDate(request.claimedAt)}
                  />
                )}
              </div>

              {fields.length > 0 && (
                <section className="space-y-3 border-t pt-4">
                  <h2 className="text-sm font-semibold">Submitted form fields</h2>
                  <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {fields.map((field) => {
                      const fieldAttachments = attachments.filter(
                        (attachment) => attachment.label === field.key,
                      );
                      return (
                        <div key={field.key} className="min-w-0 space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {field.label}
                          </p>
                          <p className="break-words text-sm font-medium">
                            {displayValue(field.value)}
                          </p>
                          {field.fileField &&
                            fieldAttachments.map((attachment) => (
                              <AttachmentLink
                                key={attachment.id}
                                attachment={attachment}
                              />
                            ))}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              <section className="space-y-3 border-t pt-4">
                <h2 className="text-sm font-semibold">Supporting documents</h2>
                {attachmentsError ? (
                  <p className="text-sm text-destructive">
                    {attachmentsError}
                  </p>
                ) : attachments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No supporting documents are attached to this request.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <AttachmentLink
                        key={attachment.id}
                        attachment={attachment}
                      />
                    ))}
                  </div>
                )}
              </section>

              {request.payments && request.payments.length > 0 && (
                <section className="space-y-3 border-t pt-4">
                  <h2 className="text-sm font-semibold">Payments</h2>
                  {request.payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          ₱{Number(payment.amount).toFixed(2)} ·{" "}
                          {payment.method.replace("_", " ")}
                        </p>
                        <p className="text-muted-foreground">
                          {payment.status} · submitted{" "}
                          {formatDate(payment.submittedAt)}
                        </p>
                        {payment.referenceNumber && (
                          <p className="text-muted-foreground">
                            Reference: {payment.referenceNumber}
                          </p>
                        )}
                        {payment.receiptNumber && (
                          <p className="text-muted-foreground">
                            Receipt: {payment.receiptNumber}
                          </p>
                        )}
                        {payment.rejectionReason && (
                          <p className="text-destructive">
                            Rejection reason: {payment.rejectionReason}
                          </p>
                        )}
                      </div>
                      {payment.paymentProofUrl && (
                        <a
                          href={payment.paymentProofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-medium text-primary underline-offset-4 hover:underline"
                        >
                          <FileText className="size-4" aria-hidden="true" />
                          View payment proof
                        </a>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {request.remarks && (
                <section className="space-y-1 border-t pt-4">
                  <h2 className="text-sm font-semibold">Requester remarks</h2>
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {request.remarks}
                  </p>
                </section>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Review</CardTitle>
              <CardDescription>
                Available actions follow the request status transitions
                accepted by the current status API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.length > 0 ? (
                <>
                  {actions.some((action) => action.status === "ready") && (
                    <div className="space-y-2">
                      <Label htmlFor="release-date">Release date</Label>
                      <Input
                        id="release-date"
                        type="date"
                        value={releaseDate}
                        onChange={(event) =>
                          setReleaseDate(event.currentTarget.value)
                        }
                        aria-required="true"
                      />
                      <p className="text-xs text-muted-foreground">
                        Required by the API before this request can be marked
                        ready.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="staff-notes">
                      Internal registrar note
                    </Label>
                    <Textarea
                      id="staff-notes"
                      value={staffNotes}
                      maxLength={1000}
                      onChange={(event) =>
                        setStaffNotes(event.currentTarget.value)
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
                    const releaseDateMissing =
                      status === "ready" && !releaseDate;
                    return (
                      <div key={status} className="space-y-1">
                        <Button
                          className="w-full gap-2"
                          disabled={
                            updating || paymentBlocked || releaseDateMissing
                          }
                          onClick={() => setPendingAction(status)}
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
                  No status changes are available for a{" "}
                  {statusConfig.label.toLowerCase()} request.
                </p>
              )}

              <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <p className="flex items-center gap-2 font-medium">
                  <Eye className="size-4" aria-hidden="true" />
                  Workflow limitations
                </p>
                <p className="mt-1 text-muted-foreground">
                  The current backend does not support moving requests to On
                  Hold or Rejected. Those actions are unavailable here.
                </p>
              </div>
            </CardContent>
          </Card>

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

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open && !updating) setPendingAction(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm request status change</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction
                ? `Are you sure you want to mark this request ${statusLabel(pendingAction).toLowerCase()}? This will update the request and notify the requester where supported.`
                : "Confirm this request status change."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Go back</AlertDialogCancel>
            <AlertDialogAction
              disabled={updating}
              onClick={confirmStatusChange}
            >
              {updating && (
                <LoaderCircle
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              Confirm change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="break-words text-sm font-medium">
        {value === null || value === undefined || value === ""
          ? "Not available"
          : value}
      </p>
    </div>
  );
}

function AttachmentLink({ attachment }: { attachment: RequestAttachment }) {
  return (
    <a
      href={attachment.fileUrl}
      target="_blank"
      rel="noreferrer"
      className="flex min-w-0 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
    >
      <FileText className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{attachment.fileName}</span>
      {attachment.label && (
        <span className="truncate text-xs text-muted-foreground">
          ({attachment.label})
        </span>
      )}
    </a>
  );
}

export default WindowRequestReview;
