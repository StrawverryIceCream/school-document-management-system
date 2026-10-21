import { useMemo, useState } from "react";
import CopyableId from "@/components/shared/CopyableId";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import TruncatedText from "@/components/shared/TruncatedText";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import DocumentRequiredFieldDialog from "./DocumentRequiredFieldDialog";
import EditDocumentRow from "./EditDocumentRow";
import EditDocument from "./EditDocument";
import { useDocument } from "@/hooks/useDocument";
import { cn } from "@/lib/utils";
import type { DocumentType } from "@/types";

export default function DocumentTable() {
  const { documents, loading, error } = useDocument();
  const [editingDocument, setEditingDocument] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  function setEdit(isEditing: boolean, documentId: number) {
    setEditingDocument(isEditing ? documentId : null);
  }

  const columns: DataTableColumn<DocumentType>[] = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        className: "w-36",
        cell: (doc) => (
          <CopyableId
            id={doc.id}
            displayValue={`#${doc.id}`}
            label={`Copy document #${doc.id}`}
          />
        ),
      },
      {
        key: "code",
        header: "Code",
        className: "w-32",
        cell: (doc) => (
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
            {doc.code}
          </code>
        ),
      },
      {
        key: "name",
        header: "Name",
        className: "min-w-44 max-w-xs",
        cell: (doc) => (
          <TruncatedText
            text={doc.name}
            className="font-semibold text-foreground max-w-48"
          />
        ),
      },
      {
        key: "description",
        header: "Description",
        className: "min-w-56 max-w-xs",
        cell: (doc) => (
          <TruncatedText
            text={doc.description || "—"}
            className="text-sm text-muted-foreground max-w-64"
          />
        ),
      },
      {
        key: "requiredFields",
        header: "Required Fields",
        className: "w-40",
        cell: (doc) => (
          <DocumentRequiredFieldDialog requiredFields={doc.requiredFields} />
        ),
      },
      {
        key: "fee",
        header: "Fee",
        className: "w-28 whitespace-nowrap",
        cell: (doc) => (
          <span className="font-semibold text-foreground">
            ₱{Number(doc.fee).toFixed(2)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "w-32",
        cell: (doc) => (
          <Badge
            variant="secondary"
            className={cn(
              "gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
              doc.isActive
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                : "bg-muted text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full shrink-0",
                doc.isActive ? "bg-emerald-600" : "bg-muted-foreground",
              )}
              aria-hidden="true"
            />
            {doc.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Action",
        className: "w-20 text-right",
        headerClassName: "text-right",
        cell: (doc) => (
          <div className="flex justify-end">
            <EditDocument document={doc} setEdit={setEdit} />
          </div>
        ),
      },
    ],
    [],
  );

  const totalPages = Math.max(1, Math.ceil(documents.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedData = documents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const customRow = (doc: DocumentType) => {
    if (editingDocument?.toString() === doc.id?.toString()) {
      return (
        <TableRow
          key={doc.id}
          className={!doc.isActive ? "text-muted-foreground" : "align-middle"}
        >
          <TableCell className="font-medium">
            <CopyableId id={doc.id} displayValue={`#${doc.id}`} />
          </TableCell>
          <EditDocumentRow document={doc} setEdit={setEdit} />
        </TableRow>
      );
    }
    return null;
  };

  return (
    <DataTable
      columns={columns}
      data={pagedData}
      keyExtractor={(doc) => doc.id}
      loading={loading}
      error={error}
      emptyMessage="No documents match your current filters."
      rowClassName={(doc) =>
        !doc.isActive ? "text-muted-foreground" : "align-middle"
      }
      customRow={customRow}
      pagination={{
        page: currentPage,
        totalPages,
        totalItems: documents.length,
        itemsPerPage: pageSize,
        itemLabel: "documents",
        onPageChange: setPage,
      }}
    />
  );
}
