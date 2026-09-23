export { cn } from "cn";
import { useLocation } from "react-router-dom";

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

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstName = parts[0];
  const lastName = parts[parts.length - 1];

  return (firstName[0] + lastName[0]).toUpperCase();
}

export function useCurrentRouteLabel() {
  const location = useLocation();
  const segment =
    location.pathname.split("/").filter(Boolean).pop() || "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}
