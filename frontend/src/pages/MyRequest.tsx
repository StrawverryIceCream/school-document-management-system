import MyRequestCards from "@/components/my_request/MyRequestCards";
import MyRequestFilters from "@/components/my_request/MyRequestFilters";
import MyRequestHeader from "@/components/my_request/MyRequestHeader";
import MyRequestTable from "@/components/my_request/MyRequestTable";
import { MyRequestProvider } from "@/provider/MyRequestProvider";
import type { RequestStatus } from "@/types";

const statusFilterOptions: Array<{
  value: "all" | RequestStatus;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "claimed", label: "Claimed" },
  { value: "cancelled", label: "Cancelled" },
];

function MyRequest() {
  return (
    <MyRequestProvider>
      <div className="h-full overflow-auto p-6 sm:p-10">
        <div className="h-full">
          <MyRequestHeader />
          <MyRequestCards />
          <MyRequestFilters statusFilterOptions={statusFilterOptions} />
          <MyRequestTable />
        </div>
      </div>
    </MyRequestProvider>
  );
}

export default MyRequest;