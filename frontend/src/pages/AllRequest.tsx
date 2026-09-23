import RequestHeader from "@/components/all_requests/RequestHeader";
import RequestSummary from "@/components/all_requests/RequestSummary";
import RequestTable from "@/components/all_requests/RequestTable";
import { useRequests } from "@/hooks/useRequests";

function AllRequest() {
  const { loading, dataSourceNote } = useRequests();

  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full">
        <RequestHeader />

        <RequestSummary />

        <p className="mb-4 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {dataSourceNote}
        </p>

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

export default AllRequest;