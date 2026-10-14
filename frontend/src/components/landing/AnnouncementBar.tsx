import { Clock, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ANNOUNCEMENT_ARIA_LABEL,
  ANNOUNCEMENT_BADGE_LABEL,
  ANNOUNCEMENT_MESSAGE,
  COUNTER_HOURS_LABEL,
  QUICK_TRACK_HREF,
  QUICK_TRACK_LABEL,
} from "@/lib/landing/announcement-bar";

export default function AnnouncementBar() {
  return (
    <aside
      aria-label={ANNOUNCEMENT_ARIA_LABEL}
      className="w-full border-b border-primary-foreground/10 bg-primary px-4 py-2.5 text-sm text-primary-foreground/90 sm:px-8"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 sm:flex-row">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded-md border-transparent bg-primary-foreground/20 text-sm font-semibold uppercase tracking-wide text-primary-foreground">
            {ANNOUNCEMENT_BADGE_LABEL}
          </Badge>
          <span>{ANNOUNCEMENT_MESSAGE}</span>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-primary-foreground/80">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4 text-secondary" aria-hidden="true" />
            {COUNTER_HOURS_LABEL}
          </span>
          <span className="hidden md:inline-block" aria-hidden="true">
            •
          </span>
          <a
            href={QUICK_TRACK_HREF}
            className="flex items-center gap-1.5 underline underline-offset-2 transition-colors hover:text-primary-foreground"
          >
            <Search className="size-4" aria-hidden="true" />
            {QUICK_TRACK_LABEL}
          </a>
        </div>
      </div>
    </aside>
  );
}
