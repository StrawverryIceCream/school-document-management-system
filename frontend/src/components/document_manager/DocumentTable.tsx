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
import { Edit, PencilOff, Settings2 } from "lucide-react";

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
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-50">Required Fields</TableHead>
          <TableHead>Fee</TableHead>
          <TableHead>Status</TableHead>
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
            <TableCell className=" max-w-100 truncate">
              {document.description}
            </TableCell>
            <TableCell>
              <Button variant="outline">
                <Settings2 />
                <span>Required Fields</span>
              </Button>
            </TableCell>
            <TableCell>₱{document.fee}</TableCell>
            <TableCell
              className={document.isActive ? "text-green-600" : "text-red-600"}
            >
              {document.isActive ? "Active" : "Inactive"}
            </TableCell>
            <TableCell className="flex item-center gap-2">
              <Button variant="default">
                <Edit />
                <span>Edit</span>
              </Button>
              <Button variant="destructive">
                <PencilOff />
                <span>Disable</span>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default DocumentTable;
