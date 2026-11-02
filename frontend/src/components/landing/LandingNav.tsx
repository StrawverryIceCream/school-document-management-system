import { LogIn, Menu, Search } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
      <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-8">
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

        <div className="flex items-center gap-2 sm:gap-3">
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
              "hidden gap-2 rounded-xl px-6 text-base font-semibold shadow-sm sm:inline-flex",
            )}
          >
            <LogIn
              className="size-5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
            {ACCESS_PORTAL_ACTION.label}
          </a>
          <div>
            <ModeToggle />
          </div>

          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-xl"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-80 flex-col justify-between p-6"
              >
                <SheetHeader className="p-0 text-left">
                  <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
                  <SheetDescription className="text-sm text-muted-foreground">
                    Quick access to document services, college offices, and
                    tracking.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-1 py-4">
                  {NAV_LINKS.map(({ label, href }) => (
                    <SheetClose asChild key={href}>
                      <a
                        href={href}
                        className="rounded-lg px-3 py-2.5 text-base font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-primary"
                      >
                        {label}
                      </a>
                    </SheetClose>
                  ))}
                </div>

                <div className="flex flex-col gap-3 border-t border-border pt-4">
                  <SheetClose asChild>
                    <a
                      href={CHECK_STATUS_ACTION.href}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "lg" }),
                        "w-full justify-center gap-2 rounded-xl text-base font-semibold",
                      )}
                    >
                      <Search className="size-5" aria-hidden="true" />
                      {CHECK_STATUS_ACTION.label}
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href={ACCESS_PORTAL_ACTION.href}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "w-full justify-center gap-2 rounded-xl text-base font-semibold shadow-sm",
                      )}
                    >
                      <LogIn className="size-5" aria-hidden="true" />
                      {ACCESS_PORTAL_ACTION.label}
                    </a>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
