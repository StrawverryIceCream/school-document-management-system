import { useState } from "react";
import { toast } from "sonner";
import { updateDocument } from "@/api/documents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useDocument } from "@/hooks/useDocument";
import { resolveDocumentOfficeCode } from "@/lib/documents";
import type { DocumentType } from "@/types";
import DocumentRequiredFieldDialog from "./DocumentRequiredFieldDialog";

function EditDocumentRow({
  document,
  setEdit,
}: {
  document: DocumentType;
  setEdit: (isEditing: boolean, documentId: string) => void;
}) {
  const { user } = useAuth();
  const { refreshDocument } = useDocument();
  const isAdmin = user?.role === "admin";
  const [code, setCode] = useState(document.code);
  const [name, setName] = useState(document.name);
  const [description, setDescription] = useState(document.description || "");
  const [fee, setFee] = useState(document.fee);
  const [processingDays, setProcessingDays] = useState(
    document.processingDays ?? 3,
  );
  const [maxCopies, setMaxCopies] = useState(document.maxCopies ?? 1);
  const [saving, setSaving] = useState(false);

  const officeName =
    document.officeRecord?.name ??
    document.officeRecord?.code ??
    document.office ??
    "Registrar";
  const officeCode = resolveDocumentOfficeCode(document) ?? "OUR";

  async function handleSubmit() {
    setSaving(true);
    try {
      await updateDocument(document.id, {
        ...(isAdmin ? { code } : {}),
        name,
        description,
        fee,
        processingDays,
        maxCopies,
      });
      setEdit(false, document.id);
      await refreshDocument();
    } catch (err) {
      console.error("Failed to update document:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update document",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setCode(document.code);
    setName(document.name);
    setDescription(document.description || "");
    setFee(document.fee);
    setProcessingDays(document.processingDays ?? 3);
    setMaxCopies(document.maxCopies ?? 1);
    setEdit(false, document.id);
  }

  return (
    <>
      <TableCell>
        <Input
          value={isAdmin ? code : document.code}
          onChange={(e) => setCode(e.target.value)}
          disabled={!isAdmin}
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
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs"
            onClick={handleCancel}
            disabled={saving}
          >
            Cancel
          </Button>
        </div>
      </TableCell>
    </>
  );
}

export default EditDocumentRow;
