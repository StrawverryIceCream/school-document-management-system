import SearchToolbar from "@/components/document_manager/SearchToolbar";
import DocumentHeader from "@/components/document_manager/DocumentHeader";
import DocumentCards from "@/components/document_manager/DocumentCards";
import DocumentTable from "@/components/document_manager/DocumentTable";

export default function DocumentManager() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4 sm:p-6">
      <DocumentHeader />
      <DocumentCards />
      <SearchToolbar />
      <div className="flex min-h-0 flex-1 flex-col">
        <DocumentTable />
      </div>
    </div>
  );
}
