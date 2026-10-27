import { LogIn, Search } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  ACCESS_PORTAL_ACTION,
  CHECK_STATUS_ACTION,
  NAV_ARIA_LABEL,
  NAV_LINKS,
} from "@/lib/landing/landing-nav";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/shared/ModeToggle";
import ArchLogo from "@/components/shared/ArchLogo";

export default function LandingNav() {
  return (
    <nav
      aria-label={NAV_ARIA_LABEL}
      className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md"
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
        <ArchLogo />

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
