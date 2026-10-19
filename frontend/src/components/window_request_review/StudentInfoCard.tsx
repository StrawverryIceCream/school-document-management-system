import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "@/components/window_request_review/Info";
import type { RequestReviewDetails } from "@/api/requests";

type Student = NonNullable<RequestReviewDetails["user"]>;

export function StudentInfoCard({ student }: { student: Student }) {
  const initials = student.fullName
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
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
  );
}
