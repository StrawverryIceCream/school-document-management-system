import { useState } from "react";
import RequestHeader from "@/components/all_requests/RequestHeader";
import RequestSummary from "@/components/all_requests/RequestSummary";
import RequestTable from "@/components/all_requests/RequestTable";
import { useRequests } from "@/hooks/useRequests";
import type { RequestRow } from "@/types";

function AllRequest() {
  const { filteredRows, loading, requests, dataSourceNote, summary } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(null);

  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full">
        <RequestHeader />

        <RequestSummary
          total={summary.total}
          pending={summary.pending}
          processing={summary.processing}
          ready={summary.ready}
        />

        <p className="mb-4 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {dataSourceNote}
        </p>

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            Loading requests...
          </div>
        ) : (
          <RequestTable
            rows={filteredRows}
            selectedRequest={selectedRequest}
            onViewRequest={setSelectedRequest}
            onCloseRequest={() => setSelectedRequest(null)}
            emptyMessage={
              requests.length === 0
                ? "No request records are available from the current backend data source yet."
                : "No requests match your current filters."
            }
          />
        )}
      </div>
    </div>
  );
}

export default AllRequest;