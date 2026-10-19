import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import { useDocument } from "@/hooks/useDocument";

const DOCUMENT_TABS: SearchToolbarTab[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function DocumentSearchToolbar() {
  const { setIsActive, setSearch, search, isActive } = useDocument();

  const activeTab =
    isActive === undefined ? "all" : isActive ? "active" : "inactive";

  const handleTabChange = (val: string) => {
    if (val === "all") setIsActive(undefined);
    else if (val === "active") setIsActive(true);
    else setIsActive(false);
  };

  return (
    <SearchToolbar
      value={search}
      onChange={setSearch}
      placeholder="Search by code, name or description"
      ariaLabel="Search documents"
      tabs={DOCUMENT_TABS}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabsAriaLabel="Filter documents by status"
    />
  );
}

export default DocumentSearchToolbar;
