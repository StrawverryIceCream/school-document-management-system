import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt, CheckCircle, XCircle, RefreshCw, Clock, ExternalLink, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export interface PaymentItem {
  id: string;
  requestId: string;
  amount: string | number;
  method: string;
  status: "pending" | "verified" | "rejected";
  receiptNumber?: string | null;
  paymentProofUrl?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  request?: {
    id: string;
    referenceNumber: string;
    documentTypeName: string;
    documentTypeCode: string;
    user?: {
      fullName: string;
      email: string;
      studentId?: string;
    };
  };
}

export default function WorkspacePayments() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<"pending" | "verified" | "rejected">("pending");
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const selectedOffice =
    searchParams.get("officeCode") ||
    user?.department ||
    user?.officeCode ||
    "CO";

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments?status=${encodeURIComponent(activeTab)}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.data || []);
      } else {
        setPayments([]);
      }
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const handleVerify = async (payment: PaymentItem) => {
    const defaultReceipt = payment.receiptNumber || `OR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const orNumber = window.prompt("Enter or confirm Official Receipt (OR) Number:", defaultReceipt);
    if (!orNumber) return;

    setActingId(payment.id);
    try {
      const res = await fetch(`/api/payments/${payment.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptNumber: orNumber, decision: "verified" }),
      });
      if (res.ok) {
        toast.success(`Payment verified with OR #${orNumber}`);
        fetchPayments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to verify payment");
      }
    } catch {
      toast.error("Network error while verifying payment");
    } finally {
      setActingId(null);
    }
  };

  const handleReject = async (payment: PaymentItem) => {
    const reason = window.prompt("Enter payment rejection reason (e.g. Unclear proof, Mismatched amount):");
    if (!reason) return;

    setActingId(payment.id);
    try {
      const res = await fetch(`/api/payments/${payment.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: reason, decision: "rejected" }),
      });
      if (res.ok) {
        toast.warning("Payment proof rejected");
        fetchPayments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to reject payment");
      }
    } catch {
      toast.error("Network error while rejecting payment");
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="size-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Payments & Assessment</h1>
            <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {selectedOffice}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review uploaded bank and e-wallet deposit slips, record Official Receipt (OR) numbers, and assess student fees.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchPayments}
          disabled={loading}
          className="self-start md:self-auto"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex h-48 items-center justify-center text-muted-foreground">
          <Clock className="mr-2 size-5 animate-spin" />
          Loading payment records...
        </div>
      ) : payments.length === 0 ? (
        <div className="flex h-48 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p className="font-medium">No payments in this view</p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Student payment transactions will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Reference / OR</TableHead>
                <TableHead>Payer</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Slip Proof</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-mono font-medium">
                      {p.request?.referenceNumber || "REQ-..."}
                    </div>
                    {p.receiptNumber && (
                      <div className="font-mono text-xs text-muted-foreground">
                        OR: {p.receiptNumber}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium leading-none">
                      {p.request?.user?.fullName || "Student Payer"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.request?.user?.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{p.request?.documentTypeName}</span>
                    <span className="ml-1.5 text-xs text-muted-foreground font-mono">
                      [{p.request?.documentTypeCode}]
                    </span>
                  </TableCell>
                  <TableCell className="font-mono font-semibold">
                    ₱{Number(p.amount || 0).toFixed(2)}
                  </TableCell>
                  <TableCell className="capitalize text-xs font-medium">
                    {p.method.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    {p.paymentProofUrl ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewUrl(p.paymentProofUrl!)}
                        className="h-7 text-xs gap-1"
                      >
                        <ImageIcon className="size-3" />
                        Preview Slip
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No slip attached
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status === "pending" && (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={actingId === p.id}
                          onClick={() => handleVerify(p)}
                          className="h-8 gap-1.5"
                        >
                          <CheckCircle className="size-3.5" />
                          Verify Payment
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={actingId === p.id}
                          onClick={() => handleReject(p)}
                          className="h-8 gap-1.5"
                        >
                          <XCircle className="size-3.5" />
                          Reject
                        </Button>
                      </div>
                    )}
                    {p.status !== "pending" && (
                      <Badge
                        variant={p.status === "verified" ? "default" : "destructive"}
                        className="capitalize font-normal"
                      >
                        {p.status}
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Slip Image Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Slip Proof</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex flex-col items-center gap-3">
              <img
                src={previewUrl}
                alt="Payment Slip Proof"
                className="max-h-[60vh] w-auto rounded-md object-contain border"
              />
              <Button variant="outline" size="sm" asChild>
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="gap-1.5">
                  <ExternalLink className="size-3.5" />
                  Open Full Image
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
