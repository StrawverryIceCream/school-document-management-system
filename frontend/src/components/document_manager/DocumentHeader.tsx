import DocumentDialog from "./DocumentDialog";

function DocumentHeader() {
  return (
    <div className="flex items-start justify-between mb-8 gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Document Manager</h1>
        <p className="text-sm mt-2">All document tracking shits </p>
      </div>
      <DocumentDialog />
    </div>
  );
}

export default DocumentHeader;
