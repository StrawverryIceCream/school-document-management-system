import type { DocumentType } from "@/types";
import { Input } from "../ui/input";
import { TableCell } from "../ui/table";
import { Button } from "../ui/button";
import { useState } from "react";
import { updateDocument } from "@/api/documents";
import { useDocument } from "@/hooks/useDocument";
import DocumentRequiredFieldDialog from "./DocumentRequiredFieldDialog";

function EditDocumentRow({
  document,
  setEdit,
}: {
  document: DocumentType;
  setEdit: (isEditing: boolean, documentId: number) => void;
}) {
  const { refreshDocument } = useDocument();
  const [code, setCode] = useState(document.code);
  const [name, setName] = useState(document.name);
  const [description, setDescription] = useState(document.description || "");
  const [fee, setFee] = useState(document.fee);

  async function handleSubmit() {
    try {
      setEdit(false, document.id);
      await updateDocument(String(document.id), {
        code,
        name,
        description,
        fee,
      });
      refreshDocument();
    } catch (err) {
      console.log("Failed to update document:", err);
    }
  }

  function handleCancel() {
    setCode(document.code);
    setName(document.name);
    setDescription(document.description || "");
    setFee(document.fee);
    setEdit(false, document.id);
  }

  return (
    <>
      <TableCell>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Document code"
        />
      </TableCell>
      <TableCell>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Document name"
        />
      </TableCell>
      <TableCell>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
        />
      </TableCell>
      <TableCell>
        <DocumentRequiredFieldDialog requiredFields={document.requiredFields} />
      </TableCell>
      <TableCell>
        <Input
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="Fee"
          type="number"
        />
      </TableCell>
      <TableCell
        className={document.isActive ? "text-green-600" : "text-red-600"}
      >
        {document.isActive ? "Active" : "Inactive"}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <Button variant="default" onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </TableCell>
    </>
  );
}

export default EditDocumentRow;
