import { Button } from "@/components/ui/button";
import { NotificationItems } from "@/components/notification/NotificationItem";
import { useNotifications } from "@/hooks/useNotification";
import { CheckCheck, Inbox, RefreshCw } from "lucide-react";

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAllAsRead,
  } = useNotifications();

  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="w-full space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold tracking-normal">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount > 0
                ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                : "You're all caught up"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto shrink-0"
              onClick={() => void markAllAsRead()}
            >
              <CheckCheck aria-hidden="true" />
              Mark all as read
            </Button>
          )}
        </header>

        {error && (
          <p role="status" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <section className="mx-auto max-w-245 rounded-xl border bg-card p-2 sm:p-3">
          {loading ? (
            <p className="px-3 py-10 text-center text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : error && notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                Notifications could not be loaded.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void refreshNotifications()}
              >
                <RefreshCw aria-hidden="true" />
                Try again
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-12 text-center">
              <Inbox
                className="size-8 text-muted-foreground/60"
                aria-hidden="true"
              />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">
                Updates about your document requests will appear here.
              </p>
            </div>
          ) : (
            <NotificationItems />
          )}
        </section>
      </div>
    </div>
  );
}
