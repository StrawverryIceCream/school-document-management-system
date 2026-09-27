import SearchToolbar from "@/components/document_manager/SearchToolbar";
import DocumentHeader from "@/components/document_manager/DocumentHeader";
import DocumentCards from "@/components/document_manager/DocumentCards";
import DocumentTable from "@/components/document_manager/DocumentTable";

function DocumentManager() {
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mx-auto h-full flex flex-col">
        <DocumentHeader />
        <DocumentCards />
        <SearchToolbar />
        <DocumentTable />
      </div>
    </div>
  );
}

export default DocumentManager;
