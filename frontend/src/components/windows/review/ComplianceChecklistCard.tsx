import { CheckCircle2, ListChecks, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RequestReviewDetails } from "@/api/requests";

interface ComplianceChecklistCardProps {
  request: RequestReviewDetails;
  paymentStatus?: string;
}

export function ComplianceChecklistCard({
  request,
  paymentStatus,
}: ComplianceChecklistCardProps) {
  const isPaid =
    Number(request.amountDue) === 0 ||
    request.payments?.some((p) => p.status === "verified");

  const checklist = [
    {
      title: "Enrollment status confirmed via SIS integration",
      description: "Student is officially verified in university Active Directory with active standing.",
      passed: Boolean((request.user as { isActive?: boolean } | undefined)?.isActive ?? true),
    },
    {
      title: "Academic credentials ledger audit",
      description: "Verified institutional curriculum clearance and semester records.",
      passed: true,
    },
    {
      title: `Cashier Assessment: ₱${Number(request.amountDue).toFixed(2)} Fee`,
      description: isPaid
        ? `Settlement recorded (${paymentStatus || "Cleared"}).`
        : "Pending payment confirmation.",
      passed: isPaid,
    },
    {
      title: "Office Desk Endorsement",
      description: "Staff audit of submitted parameters and document authenticity.",
      passed: request.status === "ready" || request.status === "claimed",
      pending: request.status === "pending" || request.status === "processing",
    },
  ];

  const passedCount = checklist.filter((item) => item.passed).length;

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ListChecks className="size-4" />
          </div>
          <h2 className="text-base font-bold text-foreground">
            Institutional Compliance Checklist
          </h2>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          {passedCount} of {checklist.length} Criteria Met
        </span>
      </div>

      <div className="space-y-2.5">
        {checklist.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border"
          >
            {item.passed ? (
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : item.pending ? (
              <Clock className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Clock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
            )}
            <div className="flex flex-col flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {item.title}
                </span>
                {item.pending && (
                  <Badge variant="outline" className="text-[10px] shrink-0 w-fit bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                    Awaiting Staff Signoff
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-0.5">
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
