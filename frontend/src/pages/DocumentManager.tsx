import SearchToolbar from "@/components/document_manager/SearchToolbar";
import DocumentHeader from "@/components/document_manager/DocumentHeader";
import DocumentTable from "@/components/document_manager/DocumentTable";
import { DocumentProvider } from "@/provider/DocumentProvider";

function DocumentManager() {
  return (
    <DocumentProvider >
      <div className="h-full overflow-hidden p-6 sm:p-10">
        <div className="mx-auto h-full flex flex-col">
          <DocumentHeader />
          <SearchToolbar />
          <DocumentTable />
        </div>
      </div>
    </DocumentProvider>
  );
}

export default DocumentManager;
