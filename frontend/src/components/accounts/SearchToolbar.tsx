import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUsers } from "@/hooks/useUsers";
import {
  ALL_TAB_VALUE,
  ROLE_TABS,
  SEARCH_ARIA_LABEL,
  SEARCH_PLACEHOLDER,
  TABS_ARIA_LABEL,
} from "@/lib/search-toolbar";

export default function SearchToolbar() {
  const { search, setSearch, role, setRole, counts } = useUsers();
  const activeTab =
    ROLE_TABS.find((tab) => tab.role === role)?.value ?? ALL_TAB_VALUE;

  return (
    <Card className="gap-4 rounded-2xl px-4 py-4 shadow-sm sm:flex-row sm:items-center">
      <div role="search" className="relative flex-1">
        <Search
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label={SEARCH_ARIA_LABEL}
          placeholder={SEARCH_PLACEHOLDER}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-11 text-base md:text-base"
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const tab = ROLE_TABS.find((item) => item.value === value);
          if (tab) setRole(tab.role);
        }}
      >
        <TabsList
          aria-label={TABS_ARIA_LABEL}
          className="group-data-horizontal/tabs:h-12"
        >
          {ROLE_TABS.map(({ value, label, countKey }) => (
            <TabsTrigger key={value} value={value} className="gap-2 px-4 text-base">
              {label}
              <Badge
                variant="secondary"
                className="h-auto px-2 py-0.5 text-sm"
              >
                {counts[countKey]}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Card>
  );
}
