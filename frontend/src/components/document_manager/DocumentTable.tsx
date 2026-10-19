import { useMemo, useState } from "react";
import DataTable, { type DataTableColumn } from "@/components/shared/DataTable";
import { TableCell, TableRow } from "@/components/ui/table";
import DocumentRequiredFieldDialog from "./DocumentRequiredFieldDialog";
import EditDocumentRow from "./EditDocumentRow";
import EditDocument from "./EditDocument";
import { useDocument } from "@/hooks/useDocument";
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
        className: "w-24",
        cell: (doc) => <span className="font-medium">#{doc.id}</span>,
      },
      {
        key: "code",
        header: "Code",
        className: "w-32",
        accessor: "code",
      },
      {
        key: "name",
        header: "Name",
        className: "max-w-48 truncate",
        accessor: "name",
      },
      {
        key: "description",
        header: "Description",
        className: "max-w-64 truncate",
        cell: (doc) => doc.description || "—",
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
        className: "w-24 whitespace-nowrap",
        cell: (doc) => `₱${doc.fee}`,
      },
      {
        key: "status",
        header: "Status",
        className: "w-28",
        cell: (doc) => (
          <span className={doc.isActive ? "text-green-600" : "text-red-600"}>
            {doc.isActive ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Action",
        className: "w-24 text-right",
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
  const pagedData = documents.slice((page - 1) * pageSize, page * pageSize);

  const customRow = (doc: DocumentType) => {
    if (editingDocument?.toString() === doc.id) {
      return (
        <TableRow
          key={doc.id}
          className={!doc.isActive ? "text-muted-foreground" : "align-middle"}
        >
          <TableCell className="font-medium">#{doc.id}</TableCell>
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
        page,
        totalPages,
        totalItems: documents.length,
        itemsPerPage: pageSize,
        itemLabel: "documents",
        onPageChange: setPage,
      }}
    />
  );
}
