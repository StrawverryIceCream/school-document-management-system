import { ClipboardPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { FieldGroup } from "../ui/field";
import RequiredFieldsDialog from "./RequiredFieldsDialog";
import DocumentFieldsDialog from "./DocumentFieldsDialog";
import { createDocument } from "@/api/document";
import type { NewDocument } from "@/types";
import { useState } from "react";
import DocumentDialogFooter from "./DocumentDialogFooter";
import DocumentDialogHeader from "./DocumentDialogHeader";
import { useDocuments } from "@/hooks/useDocuments";

function DocumentDialog() {
  const { refreshDocument } = useDocuments();
  const [newDocument, setNewDocument] = useState<NewDocument | null>(null);

  async function handleSubmit() {
    if (!newDocument) return;
    try {
      await createDocument({
        code: newDocument?.code ?? "",
        name: newDocument?.name ?? "",
        description: newDocument?.description ?? "",
        fee: newDocument?.fee ?? "0",
        isActive: newDocument?.isActive ?? true,
        requiredFields: newDocument?.requiredFields ?? [],
      });
      refreshDocument();
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
            variant="default"
          >
            <ClipboardPlus className="w-4 h-4" />
            Add Document
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DocumentDialogHeader />
          <FieldGroup>
            <DocumentFieldsDialog setNewDocument={setNewDocument} />
            <RequiredFieldsDialog setNewDocument={setNewDocument} />
          </FieldGroup>

          <DocumentDialogFooter handleSubmit={handleSubmit} />
        </DialogContent>
      </form>
    </Dialog>
  );
}

export default DocumentDialog;
