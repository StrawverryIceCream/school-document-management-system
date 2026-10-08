import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DocumentRequest } from "@/types";

const getStatusBadgeClasses = (status: DocumentRequest["status"]) => {
  switch (status) {
    case "pending":
      return "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300";
    case "processing":
      return "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300";
    case "ready":
    case "claimed":
      return "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "cancelled":
      return "border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
};

const documentNames: Record<number, string> = {
  1: "Transcript of Records",
  2: "Certificate of Registration",
  3: "True Copy of Grades",
  4: "Diploma",
};

function MyRequestDetails({
  request,
  onOpen,
}: {
  request: DocumentRequest;
  onOpen?: () => void;
}) {
  const documentName =
    documentNames[request.documentTypeId] ?? `Document #${request.documentTypeId}`;

  const formatDate = (value: Date | string | null) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={onOpen}>
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-2xl sm:max-w-2xl">
        <DialogHeader className="space-y-2">
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Review the selected request information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2 text-sm">
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Request ID</span>
            <span className="font-medium">REQ-{request.id}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Document</span>
            <span className="font-medium">{documentName}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Date Requested</span>
            <span className="font-medium">{formatDate(request.createdAt)}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Purpose</span>
            <span className="font-medium">{request.purpose ?? "—"}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Request Status</span>
            <span
              className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusBadgeClasses(request.status)}`}
            >
              {request.status}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Release Date</span>
            <span className="font-medium">{request.releaseDate ?? "—"}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Student ID</span>
            <span className="font-medium">
              {typeof request.formData.studentId === "string"
                ? request.formData.studentId
                : "—"}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_1fr] sm:items-center">
            <span className="text-muted-foreground">Notes</span>
            <span className="font-medium">{request.staffNotes ?? "—"}</span>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MyRequestDetails;
