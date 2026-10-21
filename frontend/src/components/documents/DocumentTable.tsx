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
        className: "w-28",
        cell: (doc) => (
          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs font-semibold text-foreground">
            {doc.code}
          </code>
        ),
      },
      {
        key: "name",
        header: "Name",
        className: "min-w-48 max-w-xs",
        cell: (doc) => (
          <div className="flex flex-col gap-0.5">
            <TruncatedText
              text={doc.name}
              className="font-semibold text-foreground text-sm leading-snug max-w-56"
            />
            {doc.description && (
              <span className="line-clamp-1 text-xs text-muted-foreground">
                {doc.description}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "office",
        header: "Office",
        className: "min-w-36 max-w-52",
        cell: (doc) => {
          const officeName =
            doc.officeRecord?.name ??
            doc.officeRecord?.code ??
            doc.office ??
            "Registrar";
          const officeCode =
            doc.officeRecord?.code ??
            (doc.code.includes("-") ? doc.code.split("-")[0] : "OUR");
          return (
            <div className="flex items-center gap-1.5" title={officeName}>
              <Badge
                variant="secondary"
                className="font-mono text-[11px] font-semibold shrink-0"
              >
                {officeCode}
              </Badge>
              <span className="truncate text-xs font-medium text-foreground">
                {officeName}
              </span>
            </div>
          );
        },
      },
      {
        key: "category",
        header: "Audience",
        className: "w-24 whitespace-nowrap",
        cell: (doc) => (
          <Badge variant="outline" className="capitalize text-xs font-medium">
            {doc.category || "student"}
          </Badge>
        ),
      },
      {
        key: "processingDays",
        header: "Turnaround",
        className: "w-28 whitespace-nowrap",
        cell: (doc) => (
          <span className="text-xs font-medium text-foreground">
            {doc.processingDays > 0
              ? `${doc.processingDays} working ${doc.processingDays === 1 ? "day" : "days"}`
              : "Same-day"}
          </span>
        ),
      },
      {
        key: "maxCopies",
        header: "Copies",
        className: "w-20 text-center whitespace-nowrap",
        headerClassName: "text-center",
        cell: (doc) => (
          <span className="text-xs font-medium text-muted-foreground">
            Up to {doc.maxCopies ?? 1}
          </span>
        ),
      },
      {
        key: "fee",
        header: "Fee",
        className: "w-24 whitespace-nowrap",
        cell: (doc) => {
          const fee = Number(doc.fee);
          const isFree = !Number.isFinite(fee) || fee <= 0;
          return (
            <span
              className={cn(
                "text-xs font-semibold",
                isFree
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground",
              )}
            >
              {isFree ? "Free" : `₱${fee.toFixed(2)}`}
            </span>
          );
        },
      },
      {
        key: "requiredFields",
        header: "Fields",
        className: "w-32",
        cell: (doc) => (
          <DocumentRequiredFieldDialog requiredFields={doc.requiredFields} />
        ),
      },
      {
        key: "status",
        header: "Status",
        className: "w-28",
        cell: (doc) => (
          <Badge
            variant="secondary"
            className={cn(
              "gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap",
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
        className: "w-16 text-right",
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
