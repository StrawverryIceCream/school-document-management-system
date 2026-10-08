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
    case "cancelled":
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
  { value: "cancelled", label: "Cancelled" },
];


function MyRequest() {
  return (
    <MyRequestProvider >
      <div className="h-full overflow-auto p-6 sm:p-10">
        <div className="h-full">
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
