import { Mail, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getInitials, getRequesterProfileSummary } from "@/lib/profile";
import { cn } from "@/lib/utils";
import type { RequestReviewDetails } from "@/api/requests";

type Requester = NonNullable<RequestReviewDetails["user"]>;

interface StudentInfoCardProps {
  student: Requester;
  amountDue?: string | number;
  hasRefundedPayment?: boolean;
}

export function StudentInfoCard({
  student,
  amountDue,
  hasRefundedPayment = false,
}: StudentInfoCardProps) {
  const initials = getInitials(student.fullName);
  const summary = getRequesterProfileSummary(student);
  const isCleared = Number(amountDue ?? 0) === 0;

  // Use the two role-specific identity tiles (slots 1 and 2 from summary.tiles, after Full Name)
  const identityTiles =
    student.role === "student"
      ? [summary.tiles[1], summary.tiles[2]]
      : [summary.tiles[2], summary.tiles[1]];

  return (
    <Card className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-3">
          <div
            className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0"
            aria-label={`Avatar for ${student.fullName}`}
          >
            {initials}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Requester Profile — {student.fullName}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
              {summary.subtitle}
            </p>
          </div>
        </div>
        <Badge variant={summary.badgeVariant} className="shrink-0 w-fit">
          {summary.badgeLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        {identityTiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-muted/40 p-3.5 rounded-xl border flex flex-col"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {tile.label}
            </span>
            <span
              className="text-xs sm:text-sm font-bold text-foreground mt-0.5 break-words line-clamp-2 sm:line-clamp-none leading-snug"
              title={tile.value}
            >
              {tile.value}
            </span>
            <span className="text-xs text-muted-foreground mt-1 break-words line-clamp-2 sm:line-clamp-none">
              {tile.detail}
            </span>
          </div>
        ))}

        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Request Fee Status
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                "size-2 rounded-full",
                isCleared ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <span className="text-sm font-bold text-foreground">
              {hasRefundedPayment
                ? "Refunded (₱0.00 net)"
                : isCleared
                  ? "No Fee Required (₱0.00)"
                  : `₱${Number(amountDue).toFixed(2)}`}
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            {hasRefundedPayment
              ? "Assessment fee refunded to requester"
              : isCleared
                ? "No settlement required"
                : "Payment verification required"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground border-t">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Mail className="size-3.5 text-muted-foreground" />
            <span
              className="truncate break-all sm:break-normal"
              title={student.email}
            >
              {student.email}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="size-3.5 text-muted-foreground" />
            <span>{student.contactNumber?.trim() || "Not provided"}</span>
          </div>
        </div>
        {student.role === "student" && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs font-medium">
              {summary.tiles[3].value}
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
}
