import PageHeader from "@/components/shared/PageHeader";
import { useMyRequest } from "@/hooks/useMyRequest";

export default function MyRequestHeader() {
  const { totalCount } = useMyRequest();

  return (
    <PageHeader
      title="My Requests"
      badge={`${totalCount} Total`}
      description="View and track the status of your document requests"
    />
  );
}
