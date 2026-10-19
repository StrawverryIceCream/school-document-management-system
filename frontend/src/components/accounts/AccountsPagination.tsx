import DataTablePagination from "@/components/shared/DataTablePagination";
import { useUsers } from "@/hooks/useUsers";
import {
  PAGINATION_ARIA_LABEL,
  SYNCED_LABEL,
} from "@/lib/accounts/accounts-pagination";

export default function AccountsPagination() {
  const { setPage, pagination, loading, error } = useUsers();

  if (error) return null;

  return (
    <DataTablePagination
      page={pagination.page}
      totalPages={pagination.totalPages}
      totalItems={pagination.total}
      itemsPerPage={pagination.limit}
      itemLabel="accounts"
      onPageChange={setPage}
      loading={loading}
      syncLabel={SYNCED_LABEL}
      ariaLabel={PAGINATION_ARIA_LABEL}
    />
  );
}
