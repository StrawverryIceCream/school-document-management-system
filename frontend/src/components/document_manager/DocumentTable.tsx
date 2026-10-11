import { useDocument } from "@/hooks/useDocument";
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
  const { documents, loading, error } = useDocument();
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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow>
              <TableHead className="w-24">ID</TableHead>
              <TableHead className="w-32">Code</TableHead>
              <TableHead className="min-w-48">Name</TableHead>
              <TableHead className="min-w-64">Description</TableHead>
              <TableHead className="w-40">Required Fields</TableHead>
              <TableHead className="w-24">Fee</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-12 text-center text-muted-foreground"
                >
                  No documents match your current filters.
                </TableCell>
              </TableRow>
            ) : (
              documents.map((document) => (
                <TableRow
                  key={document.id}
                  className={
                    !document.isActive
                      ? "text-muted-foreground"
                      : "align-middle"
                  }
                >
                  <TableCell className="font-medium">{document.id}</TableCell>
                  {editingDocument === document.id ? (
                    <EditDocumentRow document={document} setEdit={setEdit} />
                  ) : (
                    <>
                      <TableCell>{document.code}</TableCell>
                      <TableCell className="max-w-48 truncate">
                        {document.name}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">
                        {document.description || "—"}
                      </TableCell>
                      <TableCell>
                        <DocumentRequiredFieldDialog
                          requiredFields={document.requiredFields}
                        />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        ₱{document.fee}
                      </TableCell>
                      <TableCell
                        className={
                          document.isActive ? "text-green-600" : "text-red-600"
                        }
                      >
                        {document.isActive ? "Active" : "Inactive"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <EditDocument document={document} setEdit={setEdit} />
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default DocumentTable;
