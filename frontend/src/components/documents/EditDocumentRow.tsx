import type { DocumentType } from "@/types";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [processingDays, setProcessingDays] = useState(
    document.processingDays ?? 3,
  );
  const [maxCopies, setMaxCopies] = useState(document.maxCopies ?? 1);

  const officeName =
    document.officeRecord?.name ??
    document.officeRecord?.code ??
    document.office ??
    "Registrar";
  const officeCode =
    document.officeRecord?.code ??
    (document.code.includes("-") ? document.code.split("-")[0] : "OUR");

  async function handleSubmit() {
    try {
      setEdit(false, Number(document.id));
      await updateDocument(String(document.id), {
        code,
        name,
        description,
        fee,
        processingDays,
        maxCopies,
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
    setProcessingDays(document.processingDays ?? 3);
    setMaxCopies(document.maxCopies ?? 1);
    setEdit(false, Number(document.id));
  }

  return (
    <>
      <TableCell>
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Code"
          className="h-8 text-xs font-mono"
        />
      </TableCell>
      <TableCell className="space-y-1">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Document name"
          className="h-8 text-xs font-semibold"
        />
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="h-7 text-[11px]"
        />
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5" title={officeName}>
          <Badge
            variant="secondary"
            className="font-mono text-[11px] font-semibold shrink-0"
          >
            {officeCode}
          </Badge>
          <span className="truncate text-xs font-medium text-muted-foreground max-w-28">
            {officeName}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize text-xs font-medium">
          {document.category || "student"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            value={processingDays}
            onChange={(e) => setProcessingDays(Number(e.target.value))}
            className="h-8 w-16 text-xs"
          />
          <span className="text-[11px] text-muted-foreground">days</span>
        </div>
      </TableCell>
      <TableCell>
        <Input
          type="number"
          min={1}
          value={maxCopies}
          onChange={(e) => setMaxCopies(Number(e.target.value))}
          className="h-8 w-16 text-xs text-center"
        />
      </TableCell>
      <TableCell>
        <Input
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="Fee"
          type="number"
          min={0}
          step="0.01"
          className="h-8 w-20 text-xs font-semibold"
        />
      </TableCell>
      <TableCell>
        <DocumentRequiredFieldDialog requiredFields={document.requiredFields} />
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs font-semibold">
          {document.isActive ? "Active" : "Inactive"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1.5">
          <Button
            size="sm"
            className="h-8 px-2.5 text-xs"
            onClick={handleSubmit}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </TableCell>
    </>
  );
}

export default EditDocumentRow;
