import RequestFilter from "@/components/requests/all/RequestFilter";
import RequestHeader from "@/components/requests/all/RequestHeader";
import RequestSummary from "@/components/requests/all/RequestSummary";
import RequestTable from "@/components/requests/all/RequestTable";
import { RequestProvider } from "@/provider/RequestProvider";

function AllRequestContent() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
      <RequestHeader />
      <RequestSummary />
      <RequestFilter />
      <div className="flex min-h-0 flex-1 flex-col">
        <RequestTable />
      </div>
    </div>
  );
}

export default function AllRequest() {
  return (
    <RequestProvider>
      <AllRequestContent />
    </RequestProvider>
  );
}
