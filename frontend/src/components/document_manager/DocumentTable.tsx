import { useDocuments } from "@/hooks/useDocuments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import DocumentRequiredFieldDialog from "./DocumentRequiredFieldDialog";
import { useState } from "react";
import EditDocumentRow from "./EditDocumentRow";
import EditDocument from "./EditDocument";

function DocumentTable() {
  const { documents, loading, error } = useDocuments();
  const [editingDocument, setEditingDocument] = useState<number | null>(null);

  function setEdit(isEditing: boolean, documentId: number) {
    setEditingDocument(isEditing ? documentId : null);
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">
          Something went wrong: {error}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading Documents...</p>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader className="sticky top-0 z-10 bg-muted">
        <TableRow>
          <TableHead className="w-30">ID</TableHead>
          <TableHead className="w-30">Code</TableHead>
          <TableHead className="max-w-">Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-50">Required Fields</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow
            key={document.id}
            className={!document.isActive ? "text-muted-foreground" : ""}
          >
            <TableCell className="font-medium max-w-25 truncate">
              {document.id}
            </TableCell>
            {editingDocument === document.id ? (
              <EditDocumentRow document={document} setEdit={setEdit} />
            ) : (
              <>
                <TableCell>{document.code}</TableCell>
                <TableCell className="max-w-50 truncate">
                  {document.name}
                </TableCell>
                <TableCell className="max-w-100 truncate">
                  {document.description}
                </TableCell>
                <TableCell>
                  <DocumentRequiredFieldDialog
                    requiredFields={document.requiredFields}
                  />
                </TableCell>
                <TableCell>₱{document.fee}</TableCell>
                <TableCell
                  className={
                    document.isActive ? "text-green-600" : "text-red-600"
                  }
                >
                  {document.isActive ? "Active" : "Inactive"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end">
                    <EditDocument document={document} setEdit={setEdit} />
                  </div>
                </TableCell>
              </>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DocumentTable;
