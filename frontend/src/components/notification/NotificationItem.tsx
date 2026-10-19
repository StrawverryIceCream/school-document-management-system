import {
  Bell,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  FileText,
  XCircle,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotification";
import { useLocation } from "react-router-dom";

const DEFAULT_STYLE = {
  icon: Bell,
  className: "bg-muted text-muted-foreground",
};

const notificationStyles: Record<
  string,
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
  payment: {
    icon: CreditCard,
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  system: DEFAULT_STYLE,
};

function getNotificationKind(
  type: string | undefined,
  title: string,
  message: string,
): string {
  if (
    type &&
    type in notificationStyles &&
    type !== "system" &&
    type !== "status_update"
  ) {
    return type;
  }

  const content = `${title} ${message}`.toLowerCase();
  if (/\b(approved|accepted)\b/.test(content)) return "approved";
  if (/\b(ready|pickup|claimed|collected)\b/.test(content)) return "ready";
  if (/\b(processing|being processed)\b/.test(content)) return "processing";
  if (/\b(rejected|cancelled|canceled|denied)\b/.test(content)) {
    return "rejected";
  }
  if (/\b(payment|receipt|paid)\b/.test(content)) return "payment";
  if (/\b(submitted|new request)\b/.test(content)) return "submitted";
  return type && type in notificationStyles ? type : "system";
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
        const style = notificationStyles[kind] ?? DEFAULT_STYLE;
        const Icon = style.icon;
        const timestamp = notification.createdAt
          ? new Date(notification.createdAt)
          : new Date();
        const isValidDate = !isNaN(timestamp.getTime());
        const formattedDate = isValidDate
          ? timestamp.toLocaleDateString(undefined, {
              dateStyle: "medium",
            })
          : "—";
        const formattedTime = isValidDate
          ? timestamp.toLocaleTimeString(undefined, {
              timeStyle: "short",
            })
          : "";
        const formattedTimestamp = formattedTime
          ? `${formattedDate} · ${formattedTime}`
          : formattedDate;

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
                    notification.isRead
                      ? "text-foreground/80"
                      : "text-foreground"
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
