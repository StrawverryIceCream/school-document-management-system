import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  Check,
  X,
  Eye,
  Search,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilePreviewDialog } from "@/components/shared/FilePreviewDialog";
import {
  listAccountUpdates,
  reviewAccountUpdate,
} from "@/api/accountUpdates";
import type { AccountUpdateRequest, AccountUpdateStatus } from "@/types";

const CANNED_REASONS = [
  "Blurred or unreadable Certificate of Registration (COR) image.",
  "Uploaded COR does not match the active academic term.",
  "Requested year level or section does not match the uploaded COR.",
  "Invalid or incomplete graduation proof for alumni status.",
];

export default function AccountUpdatesTab() {
  const [updates, setUpdates] = useState<AccountUpdateRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<AccountUpdateStatus | "all">("pending");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // In-Situ Proof Preview state
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    studentName: string;
    studentId: string;
    term: string;
  } | null>(null);

  // Reject dialog state
  const [rejectingItem, setRejectingItem] = useState<AccountUpdateRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAccountUpdates({
        status: statusFilter,
        search: search.trim() || undefined,
        page,
        limit: 15,
      });
      setUpdates(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      console.error("Failed to load verification requests:", err);
      toast.error("Failed to load verification requests.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleApprove(item: AccountUpdateRequest) {
    try {
      await reviewAccountUpdate(item.id, { decision: "approved" });
      toast.success(`Approved standing update for ${item.user?.fullName || "student"}.`);
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Approval failed";
      toast.error(msg);
    }
  }

  async function handleConfirmReject() {
    if (!rejectingItem) return;
    const reason = rejectionReason.trim();
    if (!reason) {
      toast.error("Please provide or select a rejection reason.");
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewAccountUpdate(rejectingItem.id, {
        decision: "rejected",
        rejectionReason: reason,
      });
      toast.success(`Verification rejected for ${rejectingItem.user?.fullName || "student"}.`);
      setRejectingItem(null);
      setRejectionReason("");
      fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Rejection failed";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search student, ID, or section..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val as any);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] text-xs">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="all">All Statuses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
              <TableRow>
                <TableHead className="w-[220px]">Student</TableHead>
                <TableHead className="w-[110px]">Academic Term</TableHead>
                <TableHead className="w-[180px]">Previous Standing</TableHead>
                <TableHead className="w-[180px]">Requested Standing</TableHead>
                <TableHead className="w-[120px]">Proof</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-sm text-muted-foreground">
                    Loading verification requests...
                  </TableCell>
                </TableRow>
              ) : updates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center text-sm text-muted-foreground">
                    No verification requests found.
                  </TableCell>
                </TableRow>
              ) : (
                updates.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30">
                    {/* Student */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-sm">
                          {item.user?.fullName || "Unknown Student"}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {item.user?.studentId || item.user?.email}
                        </span>
                        {item.user?.course && (
                          <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                            {item.user.course.code}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Academic Term */}
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-medium">
                        {item.academicTerm}
                      </Badge>
                    </TableCell>

                    {/* Previous Standing */}
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        {item.previousStudentStatus === "alumni" ? (
                          <Badge variant="secondary" className="text-[10px]">Alumni</Badge>
                        ) : (
                          <span>
                            {item.previousYearLevel ? `${item.previousYearLevel}th Year` : "—"} •{" "}
                            {item.previousSection || "No Section"}
                            {item.previousStudentStatus && ` (${item.previousStudentStatus})`}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Requested Standing */}
                    <TableCell>
                      <div className="text-xs">
                        {item.requestedStudentStatus === "alumni" ? (
                          <Badge className="bg-primary/20 text-primary text-[10px]">
                            Alumni / Graduated
                          </Badge>
                        ) : (
                          <span className="font-medium text-foreground">
                            {item.requestedYearLevel ? `${item.requestedYearLevel}th Year` : "—"} •{" "}
                            {item.requestedSection || "No Section"}{" "}
                            <span className="capitalize text-muted-foreground">
                              ({item.requestedStudentStatus})
                            </span>
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Proof */}
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 gap-1.5 text-xs text-primary hover:text-primary/90"
                        onClick={() =>
                          setPreviewFile({
                            url: item.proofFileUrl,
                            name: item.proofFileName,
                            studentName: item.user?.fullName || "Student",
                            studentId: item.user?.studentId || "",
                            term: item.academicTerm,
                          })
                        }
                      >
                        <Eye className="size-3.5" />
                        Preview
                      </Button>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      {item.status === "pending" && (
                        <Badge
                          variant="outline"
                          className="border-amber-500/40 text-amber-600 dark:text-amber-400 text-xs"
                        >
                          <Clock className="size-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {item.status === "approved" && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs"
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          Approved
                        </Badge>
                      )}
                      {item.status === "rejected" && (
                        <div className="flex flex-col gap-0.5">
                          <Badge variant="destructive" className="text-xs w-fit">
                            <XCircle className="size-3 mr-1" />
                            Rejected
                          </Badge>
                          {item.rejectionReason && (
                            <span
                              className="text-[10px] text-muted-foreground truncate max-w-[140px]"
                              title={item.rejectionReason}
                            >
                              {item.rejectionReason}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      {item.status === "pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="default"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                            onClick={() => handleApprove(item)}
                          >
                            <Check className="size-3.5" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-8 text-xs gap-1"
                            onClick={() => {
                              setRejectingItem(item);
                              setRejectionReason(CANNED_REASONS[0]);
                            }}
                          >
                            <X className="size-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {item.reviewer ? `by ${item.reviewer.fullName}` : "Reviewed"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing {updates.length} of {total} request{total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-7 text-xs"
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-7 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Proof Preview Dialog (ADR-0001 house component) */}
      {previewFile && (
        <FilePreviewDialog
          open={!!previewFile}
          onOpenChange={(open) => !open && setPreviewFile(null)}
          title="Certificate of Registration (COR) Proof"
          subtitle={`Verification proof uploaded by ${previewFile.studentName}`}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
          metaItems={[
            { label: "Student Name", value: previewFile.studentName },
            { label: "Student ID", value: previewFile.studentId || "N/A" },
            { label: "Target Term", value: previewFile.term },
          ]}
        />
      )}

      {/* Reject Modal with Canned Reasons */}
      {rejectingItem && (
        <Dialog open={!!rejectingItem} onOpenChange={(open) => !open && setRejectingItem(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="gap-1.5">
              <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
                <AlertCircle className="size-5" />
                Reject Verification Request
              </DialogTitle>
              <DialogDescription className="text-sm">
                Provide a reason for rejecting{" "}
                <strong className="text-foreground">{rejectingItem.user?.fullName}</strong>
                's standing verification. The student will be prompted to resubmit with corrected documents.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Select Canned Reason Preset
                </label>
                <div className="space-y-1.5">
                  {CANNED_REASONS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className={`w-full text-left rounded-lg border p-2.5 text-xs transition-colors ${
                        rejectionReason === preset
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Custom Rejection Remarks
                </label>
                <Textarea
                  placeholder="Additional instructions or explanation for the student..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setRejectingItem(null)}
                disabled={submittingReview}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmReject}
                disabled={submittingReview}
              >
                {submittingReview ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
