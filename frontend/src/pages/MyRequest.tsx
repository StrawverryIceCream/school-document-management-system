import MyRequestCards from "@/components/my_request/MyRequestCards";
import MyRequestFilters from "@/components/my_request/MyRequestFilters";
import MyRequestHeader from "@/components/my_request/MyRequestHeader";
import MyRequestTable from "@/components/my_request/MyRequestTable";
import { MyRequestProvider } from "@/provider/MyRequestProvider";
import type { DocumentRequest } from "@/types";

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
          <MyRequestFilters />
          <MyRequestTable />
        </div>
      </div>
    </MyRequestProvider>
  );
}

export default MyRequest;
