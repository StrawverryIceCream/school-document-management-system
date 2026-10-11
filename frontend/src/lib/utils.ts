// Re-exported so components can keep importing cn from here.
export { cn } from "cn";
import { useLocation } from "react-router-dom";

// Route label for the SiteHeader title. Lives here because it's a tiny hook
// that only the sidebar needs; everything else in this file is domain code.
export function useCurrentRouteLabel() {
  const location = useLocation();
  const segment =
    location.pathname.split("/").filter(Boolean).pop() || "dashboard";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

export const CARD_HOVER_LIFT =
  "transition-all duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0";
