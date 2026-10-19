import { LogIn, Notebook, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  ACCESS_PORTAL_ACTION,
  BRAND_HOME_HREF,
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_VERSION,
  BRAND_VERSION_TONE,
  CHECK_STATUS_ACTION,
  NAV_ARIA_LABEL,
  NAV_LINKS,
} from "@/lib/landing/landing-nav";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/ModeToggle";

export default function LandingNav() {
  return (
    <nav
      aria-label={NAV_ARIA_LABEL}
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <a href={BRAND_HOME_HREF} className="group flex items-center gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Notebook className="size-7" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                {BRAND_NAME}
              </span>
              <Badge
                className={cn(
                  BADGE_BASE,
                  "border-transparent",
                  TONES[BRAND_VERSION_TONE].badge,
                )}
              >
                {BRAND_VERSION}
              </Badge>
            </div>
            <p className="hidden text-sm font-medium uppercase tracking-wider text-muted-foreground sm:block">
              {BRAND_TAGLINE}
            </p>
          </div>
        </a>

        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="text-base font-semibold text-foreground/80 transition-colors hover:text-primary"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href={CHECK_STATUS_ACTION.href}
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "hidden gap-2 text-base font-semibold sm:inline-flex",
            )}
          >
            <Search className="size-5" aria-hidden="true" />
            {CHECK_STATUS_ACTION.label}
          </a>
          <a
            href={ACCESS_PORTAL_ACTION.href}
            className={cn(
              buttonVariants({ size: "lg" }),
              "group gap-2 rounded-xl px-6 text-base font-semibold shadow-sm",
            )}
          >
            <LogIn
              className="size-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            {ACCESS_PORTAL_ACTION.label}
          </a>
          <div className="pl-2">
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
