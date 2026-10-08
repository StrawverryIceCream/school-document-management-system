import { useMyRequest } from "@/hooks/useMyRequest";

function MyRequestHeader() {
  const { totalCount } = useMyRequest();

  return (
    <div className="mb-6 space-y-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View and track the status of your {totalCount} document requests.
          </p>
        </div>
      </div>
    </div>
  );
}

export default MyRequestHeader;
