import { ClipboardPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { FieldGroup } from "../ui/field";
import RequiredFieldsDialog from "./RequiredFieldsDialog";
import DocumentFieldsDialog from "./DocumentFieldsDialog";
import { createDocument } from "@/api/document";
import type { NewDocument } from "@/types";
import { useState } from "react";
import DocumentDialogHeader from "./DocumentDialogHeader";
import { useDocuments } from "@/hooks/useDocuments";
import { DialogFooter } from "../ui/dialog";

function DocumentDialog() {
  const { refreshDocument } = useDocuments();
  const [newDocument, setNewDocument] = useState<NewDocument | null>(null);
  const [currentPage, setCurrentPage] = useState<1 | 2>(1);
  const [open, setOpen] = useState(false);

  const isPage1Valid =
    newDocument?.code?.trim() &&
    newDocument?.name?.trim() &&
    newDocument?.fee?.trim();

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
      setOpen(false);
      setCurrentPage(1);
      setNewDocument(null);
    } catch (err) {
      console.log(err);
    }
  }

  function handleNext() {
    setCurrentPage(2);
  }

  function handleBack() {
    setCurrentPage(1);
  }

  function handleCancel() {
    setCurrentPage(1);
    setNewDocument(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          {currentPage === 1 ? (
            <DocumentFieldsDialog setNewDocument={setNewDocument} />
          ) : (
            <RequiredFieldsDialog setNewDocument={setNewDocument} />
          )}
        </FieldGroup>

        <DialogFooter className="mt-4">
          {currentPage === 1 ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" onClick={handleNext} disabled={!isPage1Valid}>
                Next
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button type="button" onClick={() => void handleSubmit()}>
                Save Document
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DocumentDialog;
