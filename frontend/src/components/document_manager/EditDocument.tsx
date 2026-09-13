import { EllipsisVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import type { DocumentType } from "@/types";
import { deleteDocumentById, updateDocument } from "@/api/document";
import { useDocuments } from "@/hooks/useDocuments";
import DocumentDeleteAlert from "./DocumentDeleteAlert";
import { toast } from "sonner";

function EditDocument({
  document,
  setEdit,
}: {
  document: DocumentType;
  setEdit: (isEditing: boolean, documentId: number) => void;
}) {
  const { refreshDocument } = useDocuments();

  async function handleToggleActive() {
    try {
      await updateDocument(String(document.id), {
        isActive: !document.isActive,
      });
      refreshDocument();
    } catch (err) {
      console.log("Failed to toggle document status:", err);
    }
  }

  async function handleDeleteDocument() {
    try {
      await deleteDocumentById(String(document.id));
      refreshDocument();
      toast.success("Successfully Deleted");
    } catch (err) {
      console.log("Failed to delete document:", err);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
          size="icon"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          onClick={() => {
            setEdit(true, document.id);
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant={!document.isActive ? "default" : "destructive"}
          onClick={handleToggleActive}
        >
          {document.isActive ? "Disable" : "Enable"}
        </DropdownMenuItem>
        {!document.isActive && (
          <DocumentDeleteAlert handleDeleteDocument={handleDeleteDocument} />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EditDocument;
