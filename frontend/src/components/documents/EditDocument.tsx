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
import { useAuth } from "@/hooks/useAuth";
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
  setEdit: (isEditing: boolean, documentId: string) => void;
}) {
  const { user } = useAuth();
  const { refreshDocument } = useDocument();
  const [editFieldsOpen, setEditFieldsOpen] = useState(false);
  const isAdmin = user?.role === "admin";

  async function handleToggleActive() {
    try {
      await updateDocument(document.id, {
        isActive: !document.isActive,
      });
      await refreshDocument();
    } catch (err) {
      console.error("Failed to toggle document status:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update document status",
      );
    }
  }

  async function handleDeleteDocument() {
    try {
      await deleteDocumentById(document.id);
      await refreshDocument();
      toast.success("Successfully Deleted");
    } catch (err) {
      console.error("Failed to delete document:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete document",
      );
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
        {isAdmin && !document.isActive && (
          <DocumentDeleteAlert handleDeleteDocument={handleDeleteDocument} />
        )}
      </DropdownMenuContent>

      <Dialog open={editFieldsOpen} onOpenChange={setEditFieldsOpen}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DocumentDialogHeader type="Edit" />
          <EditRequiredFieldsDialog
            documentId={document.id}
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
