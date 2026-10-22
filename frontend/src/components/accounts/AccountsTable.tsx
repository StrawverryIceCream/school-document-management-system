import { useEffect, useMemo, useState } from "react";
import { Building2 } from "lucide-react";
import EditUser from "@/components/accounts/EditUser";
import { ALL_OFFICES } from "@/lib/sectors/sectors-config";
import { getOffices, type OfficeRecord } from "@/api/offices";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import TruncatedText from "@/components/shared/TruncatedText";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import {
  ACCOUNT_STATUS,
  ACTION_COLUMN_LABEL,
  EMPTY_MESSAGE,
  ERROR_PREFIX,
  formatShortId,
  getAccountSubtitle,
  ROLE_TONES,
  SELECT_ALL_LABEL,
  YOU_LABEL,
} from "@/lib/accounts/accounts-table";
import {
  PAGINATION_ARIA_LABEL,
  SYNCED_LABEL,
} from "@/lib/accounts/accounts-pagination";
import { getInitials, getTupIdLabel, ROLE_META } from "@/lib/profile";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

export default function AccountsTable() {
  const { loading, users, error, pagination, setPage } = useUsers();
  const { user: currentUser } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [dbOffices, setDbOffices] = useState<OfficeRecord[]>([]);

  useEffect(() => {
    getOffices()
      .then((data) => {
        if (data && data.length > 0) setDbOffices(data);
      })
      .catch((err) => console.error("Could not fetch offices:", err));
  }, []);

  const selectedOnPage = users.filter((u) => selectedIds.includes(u.id)).length;
  const headerChecked: boolean | "indeterminate" =
    selectedOnPage === 0
      ? false
      : selectedOnPage === users.length
        ? true
        : "indeterminate";

  const columns = useMemo<DataTableColumn<User>[]>(
    () => [
      {
        key: "select",
        className: "w-12",
        header: (
          <Checkbox
            checked={headerChecked}
            onCheckedChange={(checked) =>
              setSelectedIds(checked === true ? users.map((u) => u.id) : [])
            }
            aria-label={SELECT_ALL_LABEL}
          />
        ),
        cell: (user) => (
          <Checkbox
            checked={selectedIds.includes(user.id)}
            onCheckedChange={(checked) =>
              setSelectedIds((prev) =>
                checked === true
                  ? [...prev, user.id]
                  : prev.filter((id) => id !== user.id),
              )
            }
            aria-label={`Select ${user.fullName}`}
          />
        ),
      },
      {
        key: "id",
        className: "w-36",
        header: "ID",
        cell: (user) => (
          <CopyableId
            id={user.id}
            displayValue={formatShortId(user.id)}
            label={`Copy ID of ${user.fullName}`}
          />
        ),
      },
      {
        key: "name",
        className: "min-w-56 max-w-xs",
        header: "Name",
        cell: (user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const roleTone = TONES[ROLE_TONES[user.role]];
          const subtitle = getAccountSubtitle(user);

          return (
            <div className="flex min-w-0 max-w-xs items-center gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-xs font-semibold",
                    isCurrentUser
                      ? "bg-primary text-primary-foreground"
                      : roleTone.badge,
                  )}
                >
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center gap-2">
                  <ProfileTrigger userId={user.id}>
                    <button
                      type="button"
                      className="truncate text-left text-sm font-semibold text-foreground hover:underline"
                    >
                      <TruncatedText
                        text={user.fullName}
                        className="font-semibold text-foreground max-w-44"
                      />
                    </button>
                  </ProfileTrigger>
                  {isCurrentUser && (
                    <Badge
                      className={cn(
                        BADGE_BASE,
                        "h-auto shrink-0",
                        TONES.brand.badge,
                      )}
                    >
                      {YOU_LABEL}
                    </Badge>
                  )}
                </div>
                <TruncatedText
                  text={subtitle}
                  className="text-xs text-muted-foreground max-w-48"
                />
              </div>
            </div>
          );
        },
      },
      {
        key: "email",
        className: "min-w-56 max-w-xs",
        header: "Email",
        cell: (user) => (
          <TruncatedText
            text={user.email}
            className="text-sm text-foreground max-w-xs"
          />
        ),
      },
      {
        key: "role",
        className: "w-28",
        header: "Role",
        cell: (user) => {
          const roleTone = TONES[ROLE_TONES[user.role]];
          return (
            <Badge className={cn(BADGE_BASE, "h-auto shrink-0", roleTone.badge)}>
              <span
                className={cn("size-2 rounded-full", roleTone.dot)}
                aria-hidden="true"
              />
              {ROLE_META[user.role].label}
            </Badge>
          );
        },
      },
      {
        key: "officeDept",
        className: "min-w-36 max-w-xs",
        header: "Office / Dept",
        cell: (user) => {
          if (user.role === "staff") {
            const dbOffice = dbOffices.find(
              (o) =>
                o.id === user.officeId ||
                o.code.toUpperCase() === user.officeId?.toUpperCase(),
            );
            const officeCode =
              dbOffice?.code ||
              ALL_OFFICES.find(
                (o) =>
                  o.id === user.officeId ||
                  o.code.toUpperCase() === user.officeId?.toUpperCase(),
              )?.code ||
              (user.office === "registrar"
                ? "OUR"
                : user.office === "hr"
                  ? "HRMO"
                  : null);
            return (
              <Badge
                variant="outline"
                className="gap-1.5 py-0.5 text-xs font-medium"
              >
                <Building2 className="size-3 text-muted-foreground" />
                <span className="truncate max-w-28">
                  {officeCode || "Staff"}
                </span>
              </Badge>
            );
          }
          if (user.role === "teacher") {
            return (
              <span className="text-xs text-muted-foreground truncate max-w-36 block">
                {user.department || "—"}
              </span>
            );
          }
          if (user.role === "student") {
            return (
              <span className="text-xs text-muted-foreground truncate max-w-36 block capitalize">
                {user.studentStatus || "Student"}
              </span>
            );
          }
          return <span className="text-xs text-muted-foreground">—</span>;
        },
      },
      {
        key: "studentId",
        className: "w-36",
        header: "Student ID",
        cell: (user) => (
          <CopyableId
            id={user.studentId}
            displayValue={getTupIdLabel(user.studentId)}
            label={`Copy ID of ${user.fullName}`}
          />
        ),
      },
      {
        key: "status",
        className: "w-28",
        header: "Status",
        cell: () => (
          <Badge
            variant="secondary"
            className="gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
          >
            <span
              className="size-1.5 rounded-full shrink-0 bg-emerald-600"
              aria-hidden="true"
            />
            {ACCOUNT_STATUS.label}
          </Badge>
        ),
      },
      {
        key: "actions",
        className: "w-20 text-right",
        headerClassName: "text-right",
        header: ACTION_COLUMN_LABEL,
        cell: (user) => (
          <div className="flex justify-end">
            <EditUser user={user} />
          </div>
        ),
      },
    ],
    [users, selectedIds, headerChecked, currentUser, dbOffices],
  );

  return (
    <DataTable
      columns={columns}
      data={users}
      keyExtractor={(user) => user.id}
      loading={loading}
      error={error ? `${ERROR_PREFIX} ${error}` : null}
      emptyMessage={EMPTY_MESSAGE}
      pagination={{
        page: pagination.page,
        totalPages: pagination.totalPages,
        totalItems: pagination.total,
        itemsPerPage: pagination.limit,
        itemLabel: "accounts",
        onPageChange: setPage,
        syncLabel: SYNCED_LABEL,
        ariaLabel: PAGINATION_ARIA_LABEL,
      }}
    />
  );
}
