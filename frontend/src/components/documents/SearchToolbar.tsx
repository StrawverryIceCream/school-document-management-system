import { useMemo } from "react";
import SearchToolbar, {
  type SearchToolbarTab,
} from "@/components/shared/SearchToolbar";
import { useAuth } from "@/hooks/useAuth";
import { useDocument } from "@/hooks/useDocument";
import {
  filterDocumentsForManager,
  resolveDocumentOfficeCode,
} from "@/lib/documents";
import { exportToCsv, type ExportColumn } from "@/lib/export/csv-export";
import type { DocumentType } from "@/types";

const DOCUMENT_TABS: SearchToolbarTab[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const documentExportColumns: ExportColumn<DocumentType>[] = [
  { header: "Document Code", key: "code" },
  { header: "Document Name", key: "name" },
  {
    header: "Office",
    key: "officeRecord",
    formatter: (_, doc) => resolveDocumentOfficeCode(doc) || doc.office || "—",
  },
  {
    header: "Sector",
    key: "officeRecord",
    formatter: (_, doc) => doc.officeRecord?.sector || "—",
  },
  {
    header: "Fee (PHP)",
    key: "fee",
    formatter: (val) => (val ? Number(val).toFixed(2) : "0.00"),
  },
  { header: "Turnaround (Days)", key: "processingDays" },
  { header: "Max Copies", key: "maxCopies" },
  {
    header: "Status",
    key: "isActive",
    formatter: (val) => (val ? "Active" : "Inactive"),
  },
  { header: "Category", key: "category" },
  { header: "Description", key: "description", formatter: (val) => val || "" },
];

function DocumentSearchToolbar() {
  const { user } = useAuth();
  const { setIsActive, setSearch, search, isActive, documents } = useDocument();

  const scopedDocuments = useMemo(
    () => filterDocumentsForManager(documents, user),
    [documents, user],
  );

  const activeTab =
    isActive === undefined ? "all" : isActive ? "active" : "inactive";

  const handleTabChange = (val: string) => {
    if (val === "all") setIsActive(undefined);
    else if (val === "active") setIsActive(true);
    else setIsActive(false);
  };

  const handleExport = () => {
    const filename = `document-types-${new Date().toISOString().slice(0, 10)}`;
    exportToCsv(filename, scopedDocuments, documentExportColumns);
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
      onExport={handleExport}
    />
  );
}

export default DocumentSearchToolbar;
