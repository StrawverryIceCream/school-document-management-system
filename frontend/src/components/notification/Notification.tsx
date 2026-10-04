import { Bell, CheckCheck, Inbox, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItems } from "./NotificationItem";

function Notification() {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    error,
    usingMockData,
    refreshNotifications,
    markAllAsRead,
  } = useNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="h-[min(600px,calc(100dvh-2rem))] w-[min(600px,calc(100vw-2rem))] gap-0 overflow-hidden p-0"
        align="end"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div>
            <h2 className="text-base font-semibold">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount === 0
                ? "You're all caught up"
                : `${unreadCount} unread`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {usingMockData && (
              <span className="text-[10px] text-muted-foreground">
                Sample notifications
              </span>
            )}
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => void markAllAsRead()}
                className="h-auto px-2 py-1 text-xs"
              >
                <CheckCheck aria-hidden="true" />
                Mark all as read
              </Button>
            )}
          </div>
        </div>
        <Separator />
        {error && !usingMockData && (
          <p
            role="status"
            className="px-4 py-2 text-xs text-destructive"
          >
            {error}
          </p>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {loading ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading notifications...
            </p>
          ) : error && !usingMockData && notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-3 py-8 text-center">
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
            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
              <Inbox className="size-8 text-muted-foreground/60" aria-hidden="true" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">
                Updates about your document requests will appear here.
              </p>
            </div>
          ) : (
            <NotificationItems />
          )}
        </div>
        {!loading && notifications.length > 0 && (
          <>
            <Separator />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-10 w-full rounded-none text-sm"
              asChild
            >
              <Link to="/notifications" onClick={() => setOpen(false)}>
                View all notifications
              </Link>
            </Button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default Notification;
