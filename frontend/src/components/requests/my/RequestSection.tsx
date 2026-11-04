import PageHeader from "@/components/shared/PageHeader";
import RequestsTable from "./RequestTable";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMyRequest } from "@/hooks/useMyRequest";
import {
  REQUEST_FILTER_LABELS,
  REQUEST_FILTERS,
  REQUESTS_PAGE_SIZE,
  type RequestFilter,
} from "@/lib/requests";
import { useMemo, useState } from "react";

function RequestsSection() {
  const { requests, filteredRequests, statusFilter, setStatusFilter } =
    useMyRequest();

  const [page, setPage] = useState(1);

  const filterCounts = useMemo(() => {
    const counts: Record<RequestFilter, number> = {
      all: requests.length,
      pending: 0,
      awaiting_payment: 0,
      processing: 0,
      on_hold: 0,
      ready: 0,
      claimed: 0,
      cancelled: 0,
      rejected: 0,
    };
    for (const request of requests) counts[request.status] += 1;
    return counts;
  }, [requests]);

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRequests.length / REQUESTS_PAGE_SIZE),
  );

  const currentPage = Math.min(page, pageCount);
  const pageRequests = filteredRequests.slice(
    (currentPage - 1) * REQUESTS_PAGE_SIZE,
    currentPage * REQUESTS_PAGE_SIZE,
  );

  function handleFilterChange(next: RequestFilter) {
    setStatusFilter(next);
    setPage(1);
  }

  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title="Your Requests"
        description="Real-time tracking of credentials currently routed across university offices"
      >
        <Tabs
          value={statusFilter}
          onValueChange={(value) => handleFilterChange(value as RequestFilter)}
          className="w-full sm:w-auto min-w-0 max-w-full overflow-x-auto overflow-y-hidden scrollbar-none pb-1"
        >
          <TabsList className="h-auto justify-start rounded-full bg-muted p-1 inline-flex w-max shrink-0 sm:w-fit">
            {REQUEST_FILTERS.map((option) => (
              <TabsTrigger
                key={option}
                value={option}
                className="rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm shrink-0 flex-initial w-auto whitespace-nowrap"
              >
                {REQUEST_FILTER_LABELS[option]} ({filterCounts[option]})
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PageHeader>

      <RequestsTable
        requests={pageRequests}
        page={page}
        onPageChange={setPage}
      />
    </section>
  );
}

export default RequestsSection;
