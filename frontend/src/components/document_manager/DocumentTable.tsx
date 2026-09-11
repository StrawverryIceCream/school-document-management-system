import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

function DocumentTable() {
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
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
        <TableCell></TableCell>
      </TableBody>
    </Table>
  );
}

export default DocumentTable;
