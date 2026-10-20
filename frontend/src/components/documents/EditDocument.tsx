import { EllipsisVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { DocumentType } from "@/types";
import { deleteDocumentById, updateDocument } from "@/api/documents";
import { useDocument } from "@/hooks/useDocument";
import DocumentDeleteAlert from "./DocumentDeleteAlert";
import EditRequiredFieldsDialog from "./EditRequiredFieldsDialog";
import { toast } from "sonner";
import { useState } from "react";
import DocumentDialogHeader from "./DocumentDialogHeader";

function EditDocument({
  document,
  setEdit,
}: {
  document: DocumentType;
  setEdit: (isEditing: boolean, documentId: number) => void;
}) {
  const { refreshDocument } = useDocument();
  const [editFieldsOpen, setEditFieldsOpen] = useState(false);

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
            setEdit(true, Number(document.id));
          }}
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setEditFieldsOpen(true)}>
          Edit Fields
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

      <Dialog open={editFieldsOpen} onOpenChange={setEditFieldsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DocumentDialogHeader type="Edit" />
          <EditRequiredFieldsDialog
            documentId={Number(document.id)}
            initialFields={document.requiredFields}
            onSaveSuccess={() => {
              setEditFieldsOpen(false);
              refreshDocument();
            }}
            onCancel={() => setEditFieldsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
}

export default EditDocument;
