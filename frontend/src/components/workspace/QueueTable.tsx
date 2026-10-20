import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export interface QueueItem {
  id: string;
  referenceNumber: string;
  documentTypeCode: string;
  documentTypeName: string;
  status: string;
  amountDue: string | number;
  copies: number;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    role?: string;
  };
  office?: {
    code: string;
    name: string;
  };
}

interface QueueTableProps {
  items: QueueItem[];
  loading?: boolean;
}

const statusVariantMap: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "outline",
  processing: "default",
  action_required: "destructive",
  ready: "secondary",
};

export default function QueueTable({ items, loading }: QueueTableProps) {
  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-muted-foreground">
        <Clock className="mr-2 size-5 animate-spin" />
        Loading queue items...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
        <p className="font-medium">No requests found in this queue</p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Incoming requests matching your assigned office will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Reference</TableHead>
            <TableHead>Requester</TableHead>
            <TableHead>Document Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Amount Due</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono font-medium">
                {item.referenceNumber}
              </TableCell>
              <TableCell>
                <div className="font-medium leading-none">
                  {item.user?.fullName || "Student / Requester"}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.user?.email}
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{item.documentTypeName}</span>
                <span className="ml-1.5 text-xs text-muted-foreground font-mono">
                  [{item.documentTypeCode}]
                </span>
              </TableCell>
              <TableCell>
                <Badge
                  variant={statusVariantMap[item.status] || "outline"}
                  className="capitalize font-normal"
                >
                  {item.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell className="font-mono">
                ₱{Number(item.amountDue || 0).toFixed(2)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/windows/all/requests/${item.id}`}>
                    <Eye className="size-3.5 mr-1" />
                    Review
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
