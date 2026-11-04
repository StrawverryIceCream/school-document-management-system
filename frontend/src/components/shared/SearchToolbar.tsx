import { Download, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type SearchToolbarTab = {
  value: string;
  label: string;
  count?: number | string;
};

export interface SearchToolbarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  inputClassName?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onSubmit?: () => void;
  shortcutBadge?: string;
  tabs?: SearchToolbarTab[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  tabsAriaLabel?: string;
  onExport?: () => void;
  exportLabel?: string;
  children?: React.ReactNode;
}

export default function SearchToolbar({
  value,
  onChange,
  placeholder = "Search...",
  ariaLabel = "Search",
  className,
  inputClassName,
  inputRef,
  onSubmit,
  shortcutBadge,
  tabs,
  activeTab,
  onTabChange,
  tabsAriaLabel = "Filter tabs",
  onExport,
  exportLabel,
  children,
}: SearchToolbarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.();
  };

  return (
    <Card
      className={cn(
        "shrink-0 gap-3 rounded-2xl px-4 py-3 shadow-sm sm:flex-row sm:items-center",
        className,
      )}
    >
      <form
        role="search"
        onSubmit={handleSubmit}
        className="relative min-w-0 flex-1"
      >
        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          type="search"
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-12 pl-11 text-base md:text-base",
            shortcutBadge && "pr-14",
            inputClassName,
          )}
        />
        {shortcutBadge && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
            {shortcutBadge}
          </kbd>
        )}
      </form>

      {tabs && tabs.length > 0 && (
        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="w-full sm:w-auto min-w-0 max-w-full overflow-x-auto overflow-y-hidden scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <TabsList
            aria-label={tabsAriaLabel}
            className="group-data-horizontal/tabs:h-10 sm:group-data-horizontal/tabs:h-12 w-max inline-flex shrink-0 items-center justify-start rounded-lg bg-muted p-1"
          >
            {tabs.map(({ value: tabVal, label, count }) => (
              <TabsTrigger
                key={tabVal}
                value={tabVal}
                className="gap-2 px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium shrink-0 flex-initial w-auto whitespace-nowrap"
              >
                {label}
                {count !== undefined && (
                  <Badge
                    variant="secondary"
                    className="h-auto px-1.5 sm:px-2 py-0.5 text-xs font-semibold"
                  >
                    {count}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {onExport && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onExport}
          className="h-10 gap-2 shrink-0 rounded-xl px-3.5 text-xs font-semibold border-border hover:bg-muted/60"
          title="Export current records to CSV"
        >
          <Download className="size-4 text-muted-foreground" aria-hidden="true" />
          <span>{exportLabel ?? "Export CSV"}</span>
        </Button>
      )}

      {children}
    </Card>
  );
}
