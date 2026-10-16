import { Check, Copy } from "lucide-react";
import { useState } from "react";
import EditRow from "@/components/accounts/EditRow";
import EditUser from "@/components/accounts/EditUser";
import ProfileTrigger from "@/components/profile/ProfileTrigger";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  SKELETON_ROW_KEYS,
  TABLE_COLUMN_COUNT,
  TABLE_COLUMNS,
  YOU_LABEL,
} from "@/lib/accounts-table";
import { getInitials, getTupIdLabel, ROLE_META } from "@/lib/profile";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "cn";

export default function AccountsTable() {
  const { loading, users, error } = useUsers();
  const { user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selectedOnPage = users.filter((user) =>
    selectedIds.includes(user.id),
  ).length;
  const headerChecked: boolean | "indeterminate" =
    selectedOnPage === 0
      ? false
      : selectedOnPage === users.length
        ? true
        : "indeterminate";

  if (error) {
    return (
      <div role="alert" className="flex items-center justify-center py-12">
        <p className="text-lg text-muted-foreground">
          {ERROR_PREFIX} {error}
        </p>
      </div>
    );
  }

  return (
    <Card className="min-h-0 gap-0 overflow-hidden rounded-2xl rounded-b-none py-0 shadow-sm [&_[data-slot=table-container]]:min-h-0 [&_[data-slot=table-container]]:flex-1 [&_[data-slot=table-container]]:overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={headerChecked}
                onCheckedChange={(checked) =>
                  setSelectedIds(
                    checked === true ? users.map((user) => user.id) : [],
                  )
                }
                aria-label={SELECT_ALL_LABEL}
              />
            </TableHead>
            {TABLE_COLUMNS.map((column) => (
              <TableHead
                key={column.key}
                className={cn(
                  "text-sm font-semibold uppercase tracking-wide text-muted-foreground",
                  column.className,
                )}
              >
                {column.label}
              </TableHead>
            ))}
            <TableHead className="text-right text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {ACTION_COLUMN_LABEL}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            SKELETON_ROW_KEYS.map((rowKey) => (
              <TableRow key={rowKey}>
                <TableCell>
                  <Skeleton className="size-4" />
                </TableCell>
                {TABLE_COLUMNS.map((column) => (
                  <TableCell key={column.key}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
                <TableCell>
                  <Skeleton className="ml-auto size-8" />
                </TableCell>
              </TableRow>
            ))
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={TABLE_COLUMN_COUNT}
                className="py-12 text-center text-base text-muted-foreground"
              >
                {EMPTY_MESSAGE}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => {
              const isCurrentUser = user.id === currentUser?.id;
              const roleTone = TONES[ROLE_TONES[user.role]];

              return (
                <TableRow key={user.id} className="align-middle">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(user.id)}
                      onCheckedChange={(checked) =>
                        setSelectedIds((previous) =>
                          checked === true
                            ? [...previous, user.id]
                            : previous.filter((id) => id !== user.id),
                        )
                      }
                      aria-label={`Select ${user.fullName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code
                        className="font-mono text-sm text-muted-foreground"
                        title={user.id}
                      >
                        {formatShortId(user.id)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Copy ID of ${user.fullName}`}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(user.id);
                            setCopiedId(user.id);
                            window.setTimeout(
                              () => setCopiedId(null),
                              COPY_FEEDBACK_MS,
                            );
                          } catch (err) {
                            console.error("Failed to copy account ID:", err);
                          }
                        }}
                      >
                        {copiedId === user.id ? (
                          <Check className="size-4" aria-hidden="true" />
                        ) : (
                          <Copy className="size-4" aria-hidden="true" />
                        )}
                      </Button>
                    </div>
                  </TableCell>

                  {editingUser === user.id ? (
                    <EditRow
                      user={user}
                      setEdit={(isEditing, userId) =>
                        setEditingUser(isEditing ? userId : null)
                      }
                    />
                  ) : (
                    <>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-12">
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
                          <div className="flex min-w-0 flex-col">
                            <div className="flex flex-wrap items-center gap-2">
                              <ProfileTrigger userId={user.id}>
                                <button
                                  type="button"
                                  className="text-left text-lg font-semibold text-foreground hover:underline"
                                >
                                  {user.fullName}
                                </button>
                              </ProfileTrigger>
                              {isCurrentUser && (
                                <Badge
                                  className={cn(
                                    BADGE_BASE,
                                    "h-auto",
                                    TONES.brand.badge,
                                  )}
                                >
                                  {YOU_LABEL}
                                </Badge>
                              )}
                            </div>
                            <span className="text-base text-muted-foreground">
                              {getAccountSubtitle(user)}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-base text-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(BADGE_BASE, "h-auto", roleTone.badge)}
                        >
                          <span
                            className={cn("size-2 rounded-full", roleTone.dot)}
                            aria-hidden="true"
                          />
                          {ROLE_META[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="whitespace-nowrap rounded-md bg-muted px-2 py-1 font-mono text-sm text-foreground">
                          {getTupIdLabel(user.studentId)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center gap-2 text-base font-medium",
                            TONES[ACCOUNT_STATUS.tone].value,
                          )}
                        >
                          <ACCOUNT_STATUS.icon
                            className="size-4"
                            aria-hidden="true"
                          />
                          {ACCOUNT_STATUS.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <EditUser
                            user={user}
                            setEdit={(isEditing, userId) =>
                              setEditingUser(isEditing ? userId : null)
                            }
                          />
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Card>
  );
}
