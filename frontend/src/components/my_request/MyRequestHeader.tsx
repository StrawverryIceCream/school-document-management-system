import { useMyRequest } from "@/hooks/useMyRequest";

function MyRequestHeader() {
  const { totalCount } = useMyRequest();

  return (
    <header className="space-y-1">
      <h1 className="text-3xl font-bold tracking-normal">My Requests</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        View and track the status of your {totalCount} document requests.
      </p>
    </header>
  );
}

export default MyRequestHeader;
