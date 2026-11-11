import { useBreadcrumbs } from "@/lib/utils";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Kbd } from "@/components/ui/kbd";
import { Search } from "lucide-react";
import Notification from "@/components/notifications/Notification";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import { Fragment } from "react";

function SiteHeader() {
  const crumbs = useBreadcrumbs();
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-8 self-center" />
        <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
          <BreadcrumbList className="flex-nowrap overflow-hidden text-xs sm:text-sm">
            <BreadcrumbItem className="shrink-0">
              <BreadcrumbLink asChild>
                <Link to="/home">ARCH</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              const isIntermediate = index > 0 && index < crumbs.length - 1 && crumbs.length > 2;
              return (
                <Fragment key={crumb.to}>
                  <BreadcrumbSeparator className={isIntermediate ? "hidden sm:inline-flex shrink-0" : "shrink-0"} />
                  <BreadcrumbItem className={isIntermediate ? "hidden sm:inline-flex min-w-0 shrink" : "min-w-0 shrink"}>
                    {isLast ? (
                      <BreadcrumbPage className="font-medium truncate max-w-[110px] sm:max-w-[200px] md:max-w-none">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.to} className="truncate max-w-[80px] sm:max-w-[140px] md:max-w-none">
                          {crumb.label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-menu"))}
            className="inline-flex h-8 sm:h-9 items-center gap-2 rounded-lg border border-border/70 bg-muted/30 px-2 sm:px-3 text-xs text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Open Quick Jump (⌘K / Ctrl+K)"
            aria-label="Open Quick Jump menu"
          >
            <Search className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline font-medium">Quick Jump</span>
            <Kbd className="hidden md:inline-flex h-4.5 px-1 font-mono text-[10px]">
              {typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
                ? "⌘K"
                : "Ctrl+K"}
            </Kbd>
          </button>
          <Notification />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

export default SiteHeader;
