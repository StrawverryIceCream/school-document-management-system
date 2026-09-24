import WindowRequestTableView from "@/components/window/WindowRequestTableView";
import { useWindowView } from "@/hooks/useWindowView";

type RequestTableProps = {
  // Kept so the parent's call site doesn't change; unused until the API can filter by college
  collegeId: string;
  collegeTitle: string;
  onBack: () => void;
};

export default function RequestTable({
  collegeTitle,
  onBack,
}: RequestTableProps) {
  const {
    visibleRequests,
    usersById,
    documentTypesById,
    loading,
    error,
    filter,
    setFilter,
    search,
    setSearch,
    updateRequestStatus,
  } = useWindowView();

  return (
    <WindowRequestTableView
      collegeTitle={collegeTitle}
      onBack={onBack}
      requests={visibleRequests}
      usersById={usersById}
      documentTypesById={documentTypesById}
      loading={loading}
      error={error}
      filter={filter}
      onFilterChange={setFilter}
      search={search}
      onSearchChange={setSearch}
      onStatusChange={updateRequestStatus}
    />
  );
}
