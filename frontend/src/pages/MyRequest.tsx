import MyRequestCards from "@/components/my_request/MyRequestCards";
import MyRequestFilters from "@/components/my_request/MyRequestFilters";
import MyRequestHeader from "@/components/my_request/MyRequestHeader";
import MyRequestTable from "@/components/my_request/MyRequestTable";

function MyRequest() {
  return (
    <div className="h-full overflow-auto px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">
        <MyRequestHeader />
        <MyRequestCards />
        <MyRequestFilters />
        <MyRequestTable />
      </div>
    </div>
  );
}

export default MyRequest;