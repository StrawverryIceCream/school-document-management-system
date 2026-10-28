import { useState } from "react";
import {
  Eye,
  FileCheck,
  FileText,
  Paperclip,
  Receipt,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AttachmentLink } from "./AttachmentLink";
import { displayValue, formatDate } from "@/lib/windows/review/format";
import { formatPaymentMetaItems } from "@/lib/windows/review/preview";
import { FilePreviewDialog } from "@/components/shared/FilePreviewDialog";
import { OfficialReceiptDialog } from "@/components/payments/OfficialReceiptDialog";
import { hasOfficialReceipt } from "@/lib/payments/official-receipt";
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
  const [previewTarget, setPreviewTarget] = useState<{
    title: string;
    subtitle?: string;
    fileUrl: string | null;
    fileName?: string;
    mimeType?: string | null;
    metaItems?: Array<{ label: string; value: string }>;
  } | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);

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
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {paymentStatus || (Number(request.amountDue) === 0 ? "Free Assessment / Cleared" : "Pending Verification")}
            </p>
            {hasOfficialReceipt(request) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowReceiptDialog(true)}
                className="h-6 gap-1 px-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <Receipt className="size-3" />
                Receipt
              </Button>
            )}
          </div>
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
              <p className="text-sm font-medium text-foreground wrap-break-word">
                {displayValue(field.value)}
              </p>
              {field.fileField &&
                fieldAttachments.map((attachment) => (
                  <div key={attachment.id} className="mt-2">
                    <AttachmentLink
                      attachment={attachment}
                      onPreview={(att) =>
                        setPreviewTarget({
                          title: att.fileName || att.label || field.label,
                          subtitle: `Requirement Field: ${field.label}`,
                          fileUrl: att.fileUrl,
                          fileName: att.fileName,
                          mimeType: att.mimeType,
                        })
                      }
                    />
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
                    <span className="text-xs font-medium text-foreground truncate max-w-45">
                      {attachment.fileName || attachment.label || "Document Attachment"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Verified Attachment
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setPreviewTarget({
                        title: attachment.fileName || attachment.label || "Attached Requirement",
                        subtitle: attachment.label
                          ? `Requirement Field: ${attachment.label}`
                          : "Student Supporting Document",
                        fileUrl: attachment.fileUrl,
                        fileName: attachment.fileName,
                        mimeType: attachment.mimeType,
                      })
                    }
                    className="gap-1 text-xs font-semibold text-primary cursor-pointer hover:underline"
                  >
                    <Eye className="size-3.5" />
                    Preview
                  </Button>
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
                <div className="flex items-center gap-2">
                  {payment.status === "verified" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowReceiptDialog(true)}
                      className="gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 cursor-pointer shadow-2xs"
                    >
                      <Receipt className="size-3.5" />
                      Official Receipt
                    </Button>
                  )}
                  {payment.paymentProofUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPreviewTarget({
                          title: `Payment Proof (${payment.method.replace(/_/g, " ")})`,
                          subtitle: `Submitted for ${documentType?.name ?? request.documentTypeName}`,
                          fileUrl: payment.paymentProofUrl,
                          fileName: `payment-proof-${payment.id.slice(0, 8)}`,
                          metaItems: formatPaymentMetaItems(payment),
                        })
                      }
                      className="gap-1.5 text-xs font-semibold text-primary cursor-pointer shadow-2xs hover:bg-primary/5"
                    >
                      <Eye className="size-3.5" />
                      Preview proof
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <FilePreviewDialog
        open={previewTarget !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewTarget(null);
        }}
        title={previewTarget?.title ?? "Document Preview"}
        subtitle={previewTarget?.subtitle}
        fileUrl={previewTarget?.fileUrl ?? null}
        fileName={previewTarget?.fileName}
        mimeType={previewTarget?.mimeType}
        metaItems={previewTarget?.metaItems}
      />

      <OfficialReceiptDialog
        request={request}
        open={showReceiptDialog}
        onOpenChange={setShowReceiptDialog}
      />
    </Card>
  );
}
