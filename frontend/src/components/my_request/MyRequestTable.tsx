import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DocumentRequest } from "@/types";
import MyRequestDetails from "./MyRequestDetails";

const getStatusBadgeClasses = (status: DocumentRequest["status"]) => {
  switch (status) {
    case "pending":
      return "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
    case "processing":
      return "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
    case "ready":
    case "claimed":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "rejected":
      return "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

const documentNames: Record<number, string> = {
  1: "Transcript of Records",
  2: "Certificate of Registration",
  3: "True Copy of Grades",
  4: "Diploma",
};

const mockRequests: DocumentRequest[] = [
  {
    id: 101,
    userId: 1,
    documentTypeId: 1,
    purpose: "For scholarship application",
    formData: {
      studentId: "2026-00123",
      course: "BSIT",
    },
    status: "processing",
    releaseDate: "2026-09-30",
    createdAt: new Date("2026-09-22T09:00:00"),
    updatedAt: new Date("2026-09-22T09:00:00"),
    claimedAt: null,
    staffNotes: "Request is currently being reviewed by the registrar office.",
  },
  {
    id: 102,
    userId: 1,
    documentTypeId: 2,
    purpose: "For enrollment and validation",
    formData: {
      studentId: "2026-00123",
      semester: "1st Semester",
      schoolYear: "2026-2027",
    },
    status: "pending",
    releaseDate: null,
    createdAt: new Date("2026-09-20T13:20:00"),
    updatedAt: new Date("2026-09-20T13:20:00"),
    claimedAt: null,
    staffNotes: null,
  },
  {
    id: 103,
    userId: 1,
    documentTypeId: 3,
    purpose: "For overseas employment requirements",
    formData: {
      studentId: "2026-00123",
      yearGraduated: "2026",
    },
    status: "ready",
    releaseDate: "2026-09-25",
    createdAt: new Date("2026-09-16T10:45:00"),
    updatedAt: new Date("2026-09-16T10:45:00"),
    claimedAt: null,
    staffNotes: "Ready for release to student.",
  },
];

function MyRequestTable() {
  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[130px]">Request ID</TableHead>
                <TableHead>Document</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Request Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">REQ-{request.id}</TableCell>
                  <TableCell>
                    {documentNames[request.documentTypeId] ?? `Document #${request.documentTypeId}`}
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClasses(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <MyRequestDetails request={request} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

export default MyRequestTable;
