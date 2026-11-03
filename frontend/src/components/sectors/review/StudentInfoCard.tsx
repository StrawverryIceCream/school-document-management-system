import { Check, Mail, Phone, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { RequestReviewDetails } from "@/api/requests";

type Student = NonNullable<RequestReviewDetails["user"]> & {
  section?: string | null;
  yearLevel?: number | null;
  contactNumber?: string | null;
};

interface StudentInfoCardProps {
  student: Student;
  amountDue?: string | number;
}

export function StudentInfoCard({ student, amountDue }: StudentInfoCardProps) {
  const initials = student.fullName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isCleared = Number(amountDue ?? 0) === 0;

  return (
    <Card className="rounded-2xl border bg-card p-4 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center gap-3">
          <div
            className="size-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base shrink-0"
            aria-label={`Avatar for ${student.fullName}`}
          >
            {initials || "?"}
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Requester Profile & Academic Standing
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
              Synchronized via University Student Information System (SIS)
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className={cn(BADGE_BASE, "shrink-0 w-fit", TONES.emerald.badge)}
        >
          <Check className="size-3 mr-1" />
          Active Student
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Student ID
          </span>
          <span className="text-sm font-bold text-foreground mt-0.5">
            {student.studentId || "No ID Record"}
          </span>
          <span className="text-xs text-muted-foreground mt-1 truncate">
            {student.department || "General Department"}
          </span>
        </div>

        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Academic Program
          </span>
          <span className="text-sm font-bold text-foreground mt-0.5 truncate">
            {student.college?.name || "College Department"}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            {student.section ? `Section ${student.section}` : "Regular Track"}
            {student.yearLevel ? ` • Year ${student.yearLevel}` : ""}
          </span>
        </div>

        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Tuition & Dues Status
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={cn(
                "size-2 rounded-full",
                isCleared ? "bg-emerald-500" : "bg-amber-500",
              )}
            />
            <span className="text-sm font-bold text-foreground">
              {isCleared ? "Fully Cleared (₱0.00)" : `₱${Number(amountDue).toFixed(2)}`}
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            {isCleared ? "No outstanding holds" : "Payment verification required"}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-muted-foreground border-t">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Mail className="size-3.5 text-muted-foreground" />
            <span className="truncate">{student.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="size-3.5 text-muted-foreground" />
            <span>{student.contactNumber || "+63 917 000 0000"}</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs font-medium">
            Good Standing
          </Badge>
          <Badge variant="outline" className="text-xs font-medium">
            Clearance Verified
          </Badge>
        </div>
      </div>
    </Card>
  );
}
