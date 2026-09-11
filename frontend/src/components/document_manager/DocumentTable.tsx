import { useDocuments } from "@/hooks/useDocuments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Edit } from "lucide-react";

function DocumentTable() {
  const { documents, loading, error } = useDocuments();

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
          <TableHead className="w-60">Name</TableHead>
          <TableHead className="w-100">Description</TableHead>
          <TableHead className="w-60">Required Fields</TableHead>
          <TableHead className="w-40">Fee</TableHead>
          <TableHead className="w-40">Status</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {documents.map((document) => (
          <TableRow key={document.id}>
            <TableCell className="font-medium max-w-25 truncate">
              {document.id}
            </TableCell>
            <TableCell>{document.code}</TableCell>
            <TableCell>{document.name}</TableCell>
            <TableCell>{document.description}</TableCell>
            <TableCell>{document.id}</TableCell>
            <TableCell>{document.fee}</TableCell>
            <TableCell>{document.isActive}</TableCell>
            <TableCell>
              <Button>
                <Edit />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DocumentTable;
