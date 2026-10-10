import { Command, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Card } from "../ui/card";

type DashboardHeroProps = Omit<React.ComponentProps<"section">, "children"> & {
  greeting: string;
  userName: string;
  portalLabel: string;
  academicYear: string;
  // null hides the pickup card when nothing is rea
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
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearchSubmit();
  }

  return (
    <Card className="p-0 rounded-3xl">
      <section
        className={cn(
          "flex flex-col gap-8  bg-linear-to-br from-card via-card to-primary/20 p-6 sm:p-8",
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

        <form
          role="search"
          onSubmit={handleSubmit}
          className="w-full max-w-3xl"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search by Document Name, Request ID (#8245...), or Academic Unit..."
              aria-label="Search documents and requests"
              className="h-12 rounded-xl border-0 bg-card pl-11 pr-20 shadow-sm "
            />
            <kbd
              className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:flex"
              aria-hidden="true"
            >
              <Command className="size-3" />K
            </kbd>
          </div>
        </form>
      </section>
    </Card>
  );
}

export default DashboardHero;
