import {
  FileCheck,
  FileText,
  Paperclip,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AttachmentLink } from "./AttachmentLink";
import { displayValue, formatDate } from "@/lib/windows/review/format";
import { cn } from "@/lib/utils";
import type { ReviewField } from "@/lib/windows/review/types";
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
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 space-y-5">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileCheck className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Submitted Document Request Schema
            </h2>
            <span className="text-xs text-muted-foreground">
              {documentType?.name ?? request.documentTypeName} Dynamic Payload
            </span>
          </div>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          Doc Type: {request.documentTypeCode}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Purpose of Request
          </span>
          <p className="text-sm font-medium text-foreground">
            {request.purpose || "Official Record Endorsement"}
          </p>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Copies Required
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {request.copies} {request.copies === 1 ? "Official Copy" : "Official Copies"}
            </span>
            <span className="text-xs text-muted-foreground">Standard Security Paper</span>
          </div>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Payment Status
          </span>
          <p className="text-sm font-medium text-foreground">
            {paymentStatus || (Number(request.amountDue) === 0 ? "Free Assessment / Cleared" : "Pending Verification")}
          </p>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Target Claiming Method
          </span>
          <p className="text-sm font-medium text-foreground">
            Campus Window Counter Pickup (Window 1 — Registrar Main Hall)
          </p>
        </div>

        <div className="bg-muted/30 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Processing Turnaround
          </span>
          <p className="text-sm font-medium text-foreground">
            {request.turnaroundDays} business {request.turnaroundDays === 1 ? "day" : "days"} (Standard)
          </p>
        </div>

        {/* Dynamic Fields */}
        {fields.map((field) => {
          const fieldAttachments = attachments.filter(
            (attachment) => attachment.label === field.key,
          );
          return (
            <div
              key={field.key}
              className={cn(
                "bg-muted/30 p-3.5 rounded-xl border flex flex-col",
                typeof field.value === "string" && field.value.length > 50 && "md:col-span-2",
              )}
            >
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                {field.label}
              </span>
              <p className="text-sm font-medium text-foreground break-words">
                {displayValue(field.value)}
              </p>
              {field.fileField &&
                fieldAttachments.map((attachment) => (
                  <div key={attachment.id} className="mt-2">
                    <AttachmentLink attachment={attachment} />
                  </div>
                ))}
            </div>
          );
        })}

        {request.remarks && (
          <div className="md:col-span-2 bg-muted/30 p-3.5 rounded-xl border flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Special Instructions & Requester Note
            </span>
            <p className="text-sm text-foreground/90 italic">
              &ldquo;{request.remarks}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Attached Documents */}
      <div className="pt-2 space-y-3 border-t">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Paperclip className="size-3.5" />
            Attached Verification Requirements ({attachments.length} Files)
          </span>
        </div>

        {attachmentsError ? (
          <p className="text-xs text-destructive">{attachmentsError}</p>
        ) : attachments.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
            No supporting document files attached.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="bg-muted/30 p-3 rounded-xl border flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                      {attachment.fileName || attachment.label || "Document Attachment"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Verified Attachment
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <AttachmentLink attachment={attachment} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment records if any */}
      {request.payments && request.payments.length > 0 && (
        <div className="pt-2 space-y-3 border-t">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Payment Audit Records
          </span>
          <div className="space-y-2">
            {request.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/20 p-3 text-xs"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    ₱{Number(payment.amount).toFixed(2)} · {payment.method.replace("_", " ")}
                  </p>
                  <p className="text-muted-foreground">
                    Status: {payment.status} · Submitted: {formatDate(payment.submittedAt)}
                  </p>
                  {payment.referenceNumber && (
                    <p className="text-muted-foreground">Reference: {payment.referenceNumber}</p>
                  )}
                  {payment.receiptNumber && (
                    <p className="text-muted-foreground">Receipt: {payment.receiptNumber}</p>
                  )}
                  {payment.rejectionReason && (
                    <p className="text-destructive">Reason: {payment.rejectionReason}</p>
                  )}
                </div>
                {payment.paymentProofUrl && (
                  <a
                    href={payment.paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    <FileText className="size-3.5" />
                    View payment proof
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
