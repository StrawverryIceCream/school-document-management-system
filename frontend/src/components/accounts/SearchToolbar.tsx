import SearchToolbar from "@/components/shared/SearchToolbar";
import { useUsers } from "@/hooks/useUsers";
import {
  ALL_TAB_VALUE,
  ROLE_TABS,
  SEARCH_ARIA_LABEL,
  SEARCH_PLACEHOLDER,
  TABS_ARIA_LABEL,
} from "@/lib/accounts/search-toolbar";

export default function AccountsSearchToolbar() {
  const { search, setSearch, role, setRole, counts, exportAccounts } = useUsers();
  const activeTab =
    ROLE_TABS.find((tab) => tab.role === role)?.value ?? ALL_TAB_VALUE;

  const tabs = ROLE_TABS.map(({ value, label, countKey }) => ({
    value,
    label,
    count: counts[countKey],
  }));

  return (
    <SearchToolbar
      value={search}
      onChange={setSearch}
      placeholder={SEARCH_PLACEHOLDER}
      ariaLabel={SEARCH_ARIA_LABEL}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(value) => {
        const tab = ROLE_TABS.find((item) => item.value === value);
        if (tab) setRole(tab.role);
      }}
      tabsAriaLabel={TABS_ARIA_LABEL}
      onExport={exportAccounts}
    />
  );
}
