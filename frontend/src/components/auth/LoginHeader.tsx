import { CircleHelp, Notebook } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  BRAND_VERSION,
  BRAND_VERSION_TONE,
} from "@/lib/landing/landing-nav";
import { LOGIN_HEADER } from "@/lib/auth/login-header";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function LoginHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href={LOGIN_HEADER.homeHref}
          className="group flex items-center gap-3"
        >
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-md">
            <Notebook className="size-7" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-extrabold leading-none tracking-tight text-foreground transition-colors group-hover:text-primary">
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
            <p className="mt-1 hidden text-sm font-medium uppercase tracking-wide text-muted-foreground sm:block">
              {BRAND_TAGLINE}
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3">
          <Badge
            className={cn(
              BADGE_BASE,
              "hidden border-transparent md:inline-flex",
              TONES.neutral.badge,
            )}
          >
            <span
              className={cn(
                "size-2 animate-pulse rounded-full",
                TONES.emerald.dot,
              )}
              aria-hidden="true"
            />
            {LOGIN_HEADER.termLabel}
          </Badge>
          <a
            href={LOGIN_HEADER.helpdeskHref}
            aria-label={LOGIN_HEADER.helpdeskAriaLabel}
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "gap-2 text-base font-semibold",
            )}
          >
            <CircleHelp className="size-5" aria-hidden="true" />
            <span className="hidden sm:inline">
              {LOGIN_HEADER.helpdeskLabel}
            </span>
          </a>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
