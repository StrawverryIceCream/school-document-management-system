import MyRequestCards from "@/components/requests/my/MyRequestCards";
import MyRequestFilters from "@/components/requests/my/MyRequestFilters";
import MyRequestHeader from "@/components/requests/my/MyRequestHeader";
import MyRequestList from "@/components/requests/my/MyRequestList";

export default function MyRequest() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <MyRequestHeader />
      <MyRequestCards />
      <MyRequestFilters />
      <div className="flex min-h-0 flex-1 flex-col">
        <MyRequestList />
      </div>
    </div>
  );
}
