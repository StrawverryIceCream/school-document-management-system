import type { ActivityLog } from "@/context/LogsContext";
import { FileText, CreditCard, UserCog, FileClock, CircleHelp } from "lucide-react";

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? "s" : ""} ago`;
}

export const LOG_TYPE_META: Record<
  ActivityLog["type"],
  { icon: typeof FileText; className: string }
> = {
  request: {
    icon: FileClock,
    className:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  },
  payment: {
    icon: CreditCard,
    className:
      "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  },
  account: {
    icon: UserCog,
    className:
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  },
  document: {
    icon: FileText,
    className:
      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  },
};

const FALLBACK_LOG_TYPE_META = { icon: CircleHelp, className: "" };

// Falls back to a neutral badge if the backend ever sends a log type
// that isn't in the list above.
export function getLogTypeMeta(type: string) {
  return LOG_TYPE_META[type as ActivityLog["type"]] ?? FALLBACK_LOG_TYPE_META;
}

export function formatExactTime(dateString: string | Date) {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}