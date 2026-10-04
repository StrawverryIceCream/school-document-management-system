import type { NotificationKind } from "@/context/NotificationContext";
import {
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  XCircle,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { useLocation } from "react-router-dom";

const notificationStyles: Record<
  NotificationKind,
  { icon: typeof Bell; className: string }
> = {
  approved: {
    icon: CheckCircle2,
    className: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  ready: {
    icon: FileCheck2,
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  processing: {
    icon: Clock3,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  rejected: {
    icon: XCircle,
    className: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
  submitted: {
    icon: FileText,
    className: "bg-primary/10 text-primary",
  },
};

function getNotificationKind(
  type: NotificationKind | undefined,
  title: string,
  message: string,
): NotificationKind | undefined {
  if (type) return type;

  const content = `${title} ${message}`.toLowerCase();
  if (/\b(approved|accepted)\b/.test(content)) return "approved";
  if (/\b(ready|pickup|claimed|collected)\b/.test(content)) return "ready";
  if (/\b(processing|being processed)\b/.test(content)) return "processing";
  if (/\b(rejected|cancelled|canceled|denied)\b/.test(content)) {
    return "rejected";
  }
  if (/\b(submitted|new request)\b/.test(content)) return "submitted";
}

export function NotificationItems() {
  const { notifications, markAsRead } = useNotifications();
  const { pathname } = useLocation();
  const visibleNotifications =
    pathname === "/notifications" ? notifications : notifications.slice(0, 5);

  return (
    <div className="space-y-1">
      {visibleNotifications.map((notification) => {
        const kind = getNotificationKind(
          notification.type,
          notification.title,
          notification.message,
        );
        const style = kind
          ? notificationStyles[kind]
          : { icon: Bell, className: "bg-muted text-muted-foreground" };
        const Icon = style.icon;
        const timestamp = new Date(notification.createdAt);
        const formattedDate = timestamp.toLocaleDateString(undefined, {
          dateStyle: "medium",
        });
        const formattedTime = timestamp.toLocaleTimeString(undefined, {
          timeStyle: "short",
        });
        const formattedTimestamp = `${formattedDate} · ${formattedTime}`;

        return (
          <button
            key={notification.id}
            type="button"
            onClick={() => void markAsRead(notification.id)}
            aria-label={`${notification.isRead ? "Read" : "Unread"} notification: ${notification.title}`}
            className={`flex w-full cursor-pointer items-start gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-border/60 hover:bg-accent/60 ${
              notification.isRead ? "" : "bg-muted/60"
            }`}
          >
            <span
              className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${style.className}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-start justify-between gap-2">
                <span
                  className={`text-sm font-semibold ${
                    notification.isRead ? "text-foreground/80" : "text-foreground"
                  }`}
                >
                  {notification.title}
                </span>
                {!notification.isRead && (
                  <span
                    className="mt-1.5 size-2 shrink-0 rounded-full bg-destructive"
                    aria-label="Unread notification"
                  />
                )}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                {notification.message}
              </span>
              <time
                className="mt-2 block text-[11px] text-muted-foreground"
                dateTime={timestamp.toISOString()}
                title={formattedTimestamp}
              >
                {formattedTimestamp}
              </time>
            </span>
          </button>
        );
      })}
    </div>
  );
}
