import RequestFilter from "@/components/all_requests/RequestFilter";
import RequestHeader from "@/components/all_requests/RequestHeader";
import RequestSummary from "@/components/all_requests/RequestSummary";
import RequestTable from "@/components/all_requests/RequestTable";
import { useRequests } from "@/hooks/useRequest";
import { RequestProvider } from "@/provider/RequestProvider";

function AllRequestContent() {
  const { loading } = useRequests();

  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full space-y-6">
        <RequestHeader />

        <RequestSummary />

        <RequestFilter />

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading requests...
          </div>
        ) : (
          <RequestTable />
        )}
      </div>
    </div>
  );
}

// Provider lives here so the all-requests fetch only runs on this page
function AllRequest() {
  return (
    <RequestProvider>
      <AllRequestContent />
    </RequestProvider>
  );
}

export default AllRequest;
