import MyRequestCards from "@/components/my_request/MyRequestCards";
import MyRequestFilters from "@/components/my_request/MyRequestFilters";
import MyRequestHeader from "@/components/my_request/MyRequestHeader";
import MyRequestList from "@/components/my_request/MyRequestList";

function MyRequest() {
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col gap-8">
        <MyRequestHeader />
        <MyRequestCards />
        <MyRequestFilters />
        <MyRequestList />
      </div>
    </div>
  );
}

export default MyRequest;
