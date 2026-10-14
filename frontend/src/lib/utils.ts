// Re-exported so components can keep importing cn from here.
export { cn } from "cn";
import { useLocation } from "react-router-dom";

export function useCurrentRouteLabel() {
  const location = useLocation();
  const segment =
    location.pathname.split("/").filter(Boolean).pop() || "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export const CARD_HOVER_LIFT =
  "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";

const toLabel = (segment: string) =>
  decodeURIComponent(segment)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

export function useBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return [{ label: "Dashboard", to: "/" }];

  return segments.map((segment, index) => ({
    label: toLabel(segment),
    to: `/${segments.slice(0, index + 1).join("/")}`,
  }));
}
