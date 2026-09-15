import type { DocumentType } from "@/types";

function NewRequestFormHeader({ document }: { document: DocumentType }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">
            {document.name}
          </h1>
          {document.description && (
            <p className="text-sm mt-2 text-muted-foreground">
              {document.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewRequestFormHeader;
