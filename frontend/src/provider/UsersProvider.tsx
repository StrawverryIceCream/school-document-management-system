import { getAllUsers, type GetAllUsersParams } from "@/api/users";
import {
  UsersContext,
  type RoleCounts,
  type UsersPagination,
} from "@/context/UsersContext";
import {
  buildUsersCsv,
  downloadCsv,
  getExportFilename,
} from "@/lib/accounts/accounts-export";
import type { User, UserRole } from "@/types";
import { useCallback, useEffect, useState } from "react";

const SEARCH_DEBOUNCE_MS = 250;
const FIRST_PAGE = 1;
const ACCOUNTS_PAGE_SIZE = 6;
// Matches the backend cap in getAllUsers (max 100 per request)
const EXPORT_PAGE_SIZE = 100;
// Count requests only need pagination.total, so one row is enough
const COUNT_PROBE_LIMIT = 1;

const EMPTY_COUNTS: RoleCounts = {
  total: 0,
  student: 0,
  teacher: 0,
  staff: 0,
  admin: 0,
};

const EMPTY_PAGINATION: UsersPagination = {
  page: FIRST_PAGE,
  limit: ACCOUNTS_PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

async function fetchRoleCounts(): Promise<RoleCounts> {
  const [all, student, teacher, staff, admin] = await Promise.all([
    getAllUsers({ limit: COUNT_PROBE_LIMIT }),
    getAllUsers({ role: "student", limit: COUNT_PROBE_LIMIT }),
    getAllUsers({ role: "teacher", limit: COUNT_PROBE_LIMIT }),
    getAllUsers({ role: "staff", limit: COUNT_PROBE_LIMIT }),
    getAllUsers({ role: "admin", limit: COUNT_PROBE_LIMIT }),
  ]);

  return {
    total: all.pagination.total,
    student: student.pagination.total,
    teacher: teacher.pagination.total,
    staff: staff.pagination.total,
    admin: admin.pagination.total,
  };
}

async function fetchAllUsers(
  params: Pick<GetAllUsersParams, "role" | "search">,
): Promise<User[]> {
  const first = await getAllUsers({
    ...params,
    page: FIRST_PAGE,
    limit: EXPORT_PAGE_SIZE,
  });

  const remainingPages = Math.max(0, first.pagination.totalPages - FIRST_PAGE);
  const rest = await Promise.all(
    Array.from({ length: remainingPages }, (_, index) =>
      getAllUsers({
        ...params,
        page: FIRST_PAGE + 1 + index,
        limit: EXPORT_PAGE_SIZE,
      }),
    ),
  );

  return [first, ...rest].flatMap((response) => response.data);
}

export function UsersProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearchState] = useState("");
  const [role, setRoleState] = useState<UserRole | "">("");
  const [page, setPage] = useState(FIRST_PAGE);
  const [pagination, setPagination] = useState(EMPTY_PAGINATION);
  const [counts, setCounts] = useState(EMPTY_COUNTS);
  const [error, setError] = useState<string | null>(null);
  const [debounceSearch, setDebounceSearch] = useState(search);

  const roleFilter = role === "" ? undefined : role;

  const loadUsers = useCallback(() => {
    return getAllUsers({
      role: roleFilter,
      search: debounceSearch,
      page,
      limit: ACCOUNTS_PAGE_SIZE,
    });
  }, [roleFilter, debounceSearch, page]);

  // Debounced value and page reset change together so one search never fires two requests
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceSearch(search);
      setPage(FIRST_PAGE);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    // Ignore responses from superseded requests so a slow one can't overwrite a newer page
    let isStale = false;

    loadUsers()
      .then((response) => {
        if (isStale) return;
        setUsers(response.data);
        setPagination(response.pagination);
        setError(null);
      })
      .catch((err) => {
        if (isStale) return;
        console.error("Failed to load users:", err);
        setError(err instanceof Error ? err.message : "Failed to load users");
      })
      .finally(() => {
        if (!isStale) setLoading(false);
      });

    return () => {
      isStale = true;
    };
  }, [loadUsers]);

  useEffect(() => {
    fetchRoleCounts()
      .then(setCounts)
      .catch((err) => console.error("Failed to load account counts:", err));
  }, []);

  function setSearch(query: string) {
    setSearchState(query);
  }

  function setRole(nextRole: UserRole | "") {
    setRoleState(nextRole);
    setPage(FIRST_PAGE);
  }

  async function refreshAccounts() {
    setLoading(true);
    try {
      const [response, roleCounts] = await Promise.all([
        loadUsers(),
        fetchRoleCounts(),
      ]);
      setUsers(response.data);
      setPagination(response.pagination);
      setCounts(roleCounts);
      setError(null);

      // Deleting the last row of the last page leaves the current page empty
      if (
        response.pagination.totalPages > 0 &&
        page > response.pagination.totalPages
      ) {
        setPage(response.pagination.totalPages);
      }
    } catch (err) {
      console.error("Failed to refresh users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function exportAccounts() {
    const allUsers = await fetchAllUsers({
      role: roleFilter,
      search: debounceSearch,
    });
    downloadCsv(getExportFilename(), buildUsersCsv(allUsers));
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        role,
        setRole,
        search,
        setSearch,
        page,
        setPage,
        pagination,
        counts,
        loading,
        error,
        refreshAccounts,
        exportAccounts,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
