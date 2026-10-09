import MyRequestCards from "@/components/my_request/MyRequestCards";
import MyRequestFilters from "@/components/my_request/MyRequestFilters";
import MyRequestHeader from "@/components/my_request/MyRequestHeader";
import MyRequestTable from "@/components/my_request/MyRequestTable";

function MyRequest() {
  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full">
        <MyRequestHeader />
        <MyRequestCards />
        <MyRequestFilters />
        <MyRequestTable />
      </div>
    </div>
  );
}

export default MyRequest;
