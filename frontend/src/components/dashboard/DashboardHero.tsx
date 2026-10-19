import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import SearchToolbar from "@/components/shared/SearchToolbar";
import { cn } from "@/lib/utils";

type DashboardHeroProps = Omit<React.ComponentProps<"section">, "children"> & {
  greeting: string;
  userName: string;
  portalLabel: string;
  academicYear: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSearchSubmit: () => void;
  // Lets the page attach the Cmd/Ctrl+K shortcut without this component owning hooks
  searchInputRef?: React.Ref<HTMLInputElement>;
};

function DashboardHero({
  className,
  greeting,
  userName,
  portalLabel,
  academicYear,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  searchInputRef,
  ...props
}: DashboardHeroProps) {
  return (
    <Card className="p-0 rounded-3xl">
      <section
        className={cn(
          "flex flex-col gap-8 bg-linear-to-br from-card via-card to-primary/20 p-6 sm:p-8",
          className,
        )}
        {...props}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full flex-col gap-3">
            <Badge
              variant="secondary"
              className="w-fit gap-2 rounded-full bg-muted/80 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              <span
                className="size-3 rounded-full bg-teal-600"
                aria-hidden="true"
              />
              {portalLabel} &bull; {academicYear}
            </Badge>
            <h1 className="whitespace-nowrap text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              {greeting}, {userName}! Welcome to ARCH
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Request official academic credentials, track document window
              queues, and access authenticated digital copies seamlessly.
            </p>
          </div>
        </div>

        <div className="w-full max-w-3xl">
          <SearchToolbar
            value={searchQuery}
            onChange={onSearchQueryChange}
            onSubmit={onSearchSubmit}
            inputRef={searchInputRef}
            placeholder="Search by Document Name, Request ID (#8245...), or Academic Unit..."
            ariaLabel="Search documents and requests"
            shortcutBadge="⌘K"
            className="border border-border/70 bg-card/90 shadow-md backdrop-blur-sm"
          />
        </div>
      </section>
    </Card>
  );
}

export default DashboardHero;
