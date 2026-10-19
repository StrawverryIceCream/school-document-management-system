import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttachmentLink } from "@/components/window_request_review/AttachmentLink";
import { Info } from "@/components/window_request_review/Info";
import { displayValue, formatDate } from "@/lib/window_request_review/format";
import type { ReviewField } from "@/lib/window_request_review/types";
import type { RequestReviewDetails } from "@/api/requests";
import type { RequestAttachment } from "@/types";

export function RequestDetailsCard({
  request,
  paymentStatus,
  fields,
  attachments,
  attachmentsError,
}: {
  request: RequestReviewDetails;
  paymentStatus: string | undefined;
  fields: ReviewField[];
  attachments: RequestAttachment[];
  attachmentsError: string | null;
}) {
  const documentType = request.documentType;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
        <CardDescription>
          Submitted information and document configuration for this request.
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
          <Info label="Turnaround" value={`${request.turnaroundDays} days`} />
          {request.releaseDate && (
            <Info
              label="Release date"
              value={formatDate(request.releaseDate)}
            />
          )}
          {request.claimedAt && (
            <Info label="Claimed" value={formatDate(request.claimedAt)} />
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
            <p className="text-sm text-destructive">{attachmentsError}</p>
          ) : attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No supporting documents are attached to this request.
            </p>
          ) : (
            <div className="space-y-2">
              {attachments.map((attachment) => (
                <AttachmentLink key={attachment.id} attachment={attachment} />
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
  );
}
