import SearchToolbar from "@/components/document_manager/SearchToolbar";
import DocumentHeader from "@/components/document_manager/DocumentHeader";
import DocumentCards from "@/components/document_manager/DocumentCards";
import DocumentTable from "@/components/document_manager/DocumentTable";
import DocumentNavPage from "@/components/document_manager/DocumentNavPage";

function DocumentManager() {
  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full space-y-6">
        <DocumentHeader />
        <DocumentCards />
        <SearchToolbar />
        <DocumentTable />
        <DocumentNavPage />
      </div>
    </div>
  );
}

export default DocumentManager;
