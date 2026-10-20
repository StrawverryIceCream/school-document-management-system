import { Check, Copy } from "lucide-react";
import { useMemo, useState } from "react";
import EditRow from "@/components/accounts/EditRow";
import EditUser from "@/components/accounts/EditUser";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TableCell, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import {
  ACCOUNT_STATUS,
  ACTION_COLUMN_LABEL,
  COPY_FEEDBACK_MS,
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
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedOnPage = users.filter((u) => selectedIds.includes(u.id)).length;
  const headerChecked: boolean | "indeterminate" =
    selectedOnPage === 0
      ? false
      : selectedOnPage === users.length
        ? true
        : "indeterminate";

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), COPY_FEEDBACK_MS);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

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
        className: "w-48",
        header: "Identifier (UUID)",
        cell: (user) => (
          <div className="flex items-center gap-2">
            <code
              className="max-w-32 truncate font-mono text-sm text-muted-foreground"
              title={user.id}
            >
              {formatShortId(user.id)}
            </code>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Copy ID of ${user.fullName}`}
              onClick={() => handleCopy(user.id, `id-${user.id}`)}
            >
              {copiedKey === `id-${user.id}` ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        ),
      },
      {
        key: "name",
        className: "min-w-64 max-w-xs",
        header: "Name",
        cell: (user) => {
          const isCurrentUser = user.id === currentUser?.id;
          const roleTone = TONES[ROLE_TONES[user.role]];
          const subtitle = getAccountSubtitle(user);

          return (
            <div className="flex min-w-0 max-w-xs items-center gap-3">
              <Avatar className="size-12 shrink-0">
                <AvatarFallback
                  className={cn(
                    "text-base font-semibold",
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
                      className="truncate text-left text-lg font-semibold text-foreground hover:underline"
                      title={user.fullName}
                    >
                      {user.fullName}
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
                <span
                  className="truncate text-base text-muted-foreground"
                  title={subtitle}
                >
                  {subtitle}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "email",
        className: "min-w-64 max-w-xs",
        header: "Institutional Email",
        cell: (user) => (
          <span
            className="block max-w-xs truncate text-base text-foreground"
            title={user.email}
          >
            {user.email}
          </span>
        ),
      },
      {
        key: "role",
        className: "w-36",
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
        key: "studentId",
        className: "w-48",
        header: "Student / Staff ID",
        cell: (user) => (
          <div className="flex items-center gap-2">
            <code
              className="max-w-32 truncate rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground"
              title={user.studentId ?? undefined}
            >
              {getTupIdLabel(user.studentId)}
            </code>
            {user.studentId && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Copy Student ID of ${user.fullName}`}
                onClick={() =>
                  handleCopy(user.studentId!, `student-${user.id}`)
                }
              >
                {copiedKey === `student-${user.id}` ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Copy className="size-4" aria-hidden="true" />
                )}
              </Button>
            )}
          </div>
        ),
      },
      {
        key: "status",
        className: "w-36",
        header: "Status",
        cell: () => (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-2 text-base font-medium",
              TONES[ACCOUNT_STATUS.tone].value,
            )}
          >
            <ACCOUNT_STATUS.icon className="size-4" aria-hidden="true" />
            {ACCOUNT_STATUS.label}
          </span>
        ),
      },
      {
        key: "actions",
        className: "text-right",
        headerClassName: "text-right",
        header: ACTION_COLUMN_LABEL,
        cell: (user) => (
          <div className="flex justify-end">
            <EditUser
              user={user}
              setEdit={(isEditing, userId) =>
                setEditingUser(isEditing ? userId : null)
              }
            />
          </div>
        ),
      },
    ],
    [users, selectedIds, headerChecked, currentUser, copiedKey],
  );

  const renderCustomRow = (user: User) => {
    if (editingUser !== user.id) return undefined;

    return (
      <TableRow key={user.id} className="align-middle bg-muted/20">
        <TableCell>
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
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <code
              className="max-w-32 truncate font-mono text-sm text-muted-foreground"
              title={user.id}
            >
              {formatShortId(user.id)}
            </code>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Copy ID of ${user.fullName}`}
              onClick={() => handleCopy(user.id, `id-${user.id}`)}
            >
              {copiedKey === `id-${user.id}` ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Copy className="size-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </TableCell>
        <EditRow
          user={user}
          setEdit={(isEditing, userId) =>
            setEditingUser(isEditing ? userId : null)
          }
        />
      </TableRow>
    );
  };

  return (
    <DataTable
      columns={columns}
      data={users}
      keyExtractor={(user) => user.id}
      loading={loading}
      error={error ? `${ERROR_PREFIX} ${error}` : null}
      emptyMessage={EMPTY_MESSAGE}
      customRow={renderCustomRow}
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
