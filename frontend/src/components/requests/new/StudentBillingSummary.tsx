import { BriefcaseBusiness, UserRound } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";

interface StudentBillingSummaryProps {
  documentName: string;
  feeLabel: string;
  paymentRequired: boolean;
  officeName?: string;
  processingDays?: number;
}

function StudentBillingSummary({
  documentName,
  feeLabel,
  paymentRequired,
  officeName,
  processingDays,
}: StudentBillingSummaryProps) {
  const { user } = useAuth();

  const turnaroundLabel =
    processingDays !== undefined
      ? processingDays > 0
        ? `${processingDays} working ${processingDays === 1 ? "day" : "days"}`
        : "Same-day issuance"
      : undefined;

  return (
    <Card className="gap-3 rounded-xl border-0 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Section B • Student Billing Data
        </p>
        <BriefcaseBusiness
          className="size-3.5 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
      <div className="grid gap-3 rounded-lg bg-muted p-3 sm:grid-cols-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Authorized requester
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm font-semibold">
            <UserRound className="size-3 shrink-0" aria-hidden="true" />
            {user?.fullName ?? "Account name unavailable"}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Student ID No.
          </p>
          <p className="mt-1 text-sm font-semibold">
            {user?.studentId ?? "Not provided"}
          </p>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Account email
          </p>
          <p className="mt-1 break-all text-sm">
            {user?.email ?? "No email on file"}
          </p>
        </div>
      </div>

      <div className="space-y-2 px-1">
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-muted-foreground">{documentName}</span>
          <span className="shrink-0 font-medium">
            {paymentRequired ? feeLabel : "Free (₱0.00)"}
          </span>
        </div>
        {officeName && (
          <div className="flex items-center justify-between gap-3 border-t pt-2 text-sm">
            <span className="text-muted-foreground">Issuing office</span>
            <span className="font-medium text-foreground">{officeName}</span>
          </div>
        )}
        {turnaroundLabel && (
          <div className="flex items-center justify-between gap-3 border-t pt-2 text-sm">
            <span className="text-muted-foreground">Processing estimate</span>
            <span className="font-medium text-foreground">{turnaroundLabel}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-3 border-t pt-2 text-sm">
          <span className="text-muted-foreground">Additional fees</span>
          <span className="font-medium">None listed</span>
        </div>
        <div className="flex items-center justify-between gap-3 border-t pt-2">
          <span className="text-sm font-semibold">
            {paymentRequired ? "Total Settlement Due" : "Payment status"}
          </span>
          <span className="text-right text-base font-bold text-primary sm:text-xl">
            {paymentRequired ? feeLabel : "No payment required"}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default StudentBillingSummary;
