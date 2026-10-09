import MyRequestCards from "@/components/my_request/MyRequestCards";
import MyRequestFilters from "@/components/my_request/MyRequestFilters";
import MyRequestTable from "@/components/my_request/MyRequestTable";
import CreateRequest from "@/components/new_request/CreateRequest";

function Home() {
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-normal">Home</h1>
            <p className="text-sm mt-2">
              Request and track your important document
            </p>
          </div>
        </div>
        <CreateRequest />

        <div className="flex items-start justify-between mb-8 mt-8">
          <h1 className="text-2xl font-bold tracking-normal">Your Request</h1>
        </div>
        <MyRequestCards />
        <MyRequestFilters />
        <MyRequestTable />
      </div>
    </div>
  );
}

export default Home;
