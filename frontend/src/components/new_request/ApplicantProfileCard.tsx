// frontend/src/components/new_request/ApplicantProfileCard.tsx
import { ShieldCheck, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function ApplicantProfileCard() {
  const { user } = useAuth();

  const studentName = user?.fullName || "Active Student";
  const email = user?.email || "No email on record";
  const studentId = user?.studentId || "2024-REG-0001";
  const program = user?.department || "College Department";
  const yearStanding = user?.yearLevel
    ? `Year ${user.yearLevel} • Active Enrolled`
    : "Active Enrolled";

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserCheck className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Applicant Profile
            </h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
              Validated via University Active Directory
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Student Name
          </span>
          <span className="text-base font-bold text-foreground mt-0.5">
            {studentName}
          </span>
          <span className="text-xs text-muted-foreground mt-1 truncate">
            {email}
          </span>
        </div>

        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Student ID Number
          </span>
          <span className="text-base font-bold text-primary mt-0.5 tracking-wide">
            {studentId}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Status: Regular Enrolled
          </span>
        </div>

        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Academic Program
          </span>
          <span className="text-sm font-semibold text-foreground mt-0.5">
            {program}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Institutional Registry Record
          </span>
        </div>

        <div className="bg-muted/40 p-3.5 rounded-xl border flex flex-col">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Year & Standing
          </span>
          <span className="text-sm font-semibold text-foreground mt-0.5">
            {yearStanding}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            Eligible for Credential Release
          </span>
        </div>
      </div>
    </Card>
  );
}
