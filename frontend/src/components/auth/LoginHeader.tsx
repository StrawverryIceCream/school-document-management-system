import { CircleHelp } from "lucide-react";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LOGIN_HEADER } from "@/lib/auth/login-header";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import ArchLogo from "@/components/shared/ArchLogo";

export default function LoginHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <ArchLogo href={LOGIN_HEADER.homeHref} />

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
