import MyRequestCards from "@/components/my_request/MyRequestCards";
import MyRequestFilters from "@/components/my_request/MyRequestFilters";
import MyRequestHeader from "@/components/my_request/MyRequestHeader";
import MyRequestTable from "@/components/my_request/MyRequestTable";
import { MyRequestProvider } from "@/provider/MyRequestProvider";
import type { DocumentRequest, RequestStatus } from "@/types";

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

const statusFilterOptions: Array<{ value: "all" | RequestStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "claimed", label: "Claimed" },
  { value: "rejected", label: "Rejected" },
];

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
    tags: [
      "REQ-101",
      "TOR",
      "transcript",
      "transcript of records",
      "grades",
      "academic",
    ],
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
    tags: [
      "REQ-102",
      "COR",
      "certificate",
      "certificate of registration",
      "registration",
      "enrollment",
      "semester",
      "school-year",
    ],
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
    tags: [
      "REQ-103",
      "grades",
      "true-copy",
      "true copy of grades",
      "employment",
      "records",
    ],
  },
];

function MyRequest() {
  return (
    <MyRequestProvider requests={mockRequests}>
      <div className="h-full overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-full flex flex-col space-y-6">
          <MyRequestHeader />
          <MyRequestCards />
          <MyRequestFilters statusFilterOptions={statusFilterOptions} />
          <MyRequestTable
            documentNames={documentNames}
            getStatusBadgeClasses={getStatusBadgeClasses}
          />
        </div>
      </div>
    </MyRequestProvider>
  );
}

export default MyRequest;
