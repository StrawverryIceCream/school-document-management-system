import { CheckCircle2, Printer, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  extractOfficialReceiptData,
  type OfficialReceiptData,
} from "@/lib/payments/official-receipt";
import type { DocumentRequestWithRelations } from "@/types";

export interface OfficialReceiptDialogProps {
  request: Partial<DocumentRequestWithRelations> | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OfficialReceiptDialog({
  request,
  open,
  onOpenChange,
}: OfficialReceiptDialogProps) {
  if (!request) return null;

  const data: OfficialReceiptData | null = extractOfficialReceiptData(request);
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = data.verifiedAt
    ? new Date(data.verifiedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg p-6 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 text-left border-b pb-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground">
              Republic of the Philippines
            </span>
            <Badge
              variant="outline"
              className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 gap-1 text-[11px] font-semibold"
            >
              <CheckCircle2 className="size-3" /> Settled & Verified
            </Badge>
          </div>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
            Official Receipt (Electronic Voucher)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Office of the University Cashier · Document Management & Assessment
          </DialogDescription>
        </DialogHeader>

        {/* Receipt Container optimized for on-screen & print layout */}
        <div className="rounded-xl border bg-card p-5 space-y-4 shadow-2xs print:border-none print:shadow-none print:p-0">
          {/* Receipt Top Meta */}
          <div className="flex flex-wrap items-start justify-between gap-3 bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Official Receipt No.
              </span>
              <p className="font-mono text-base font-extrabold text-primary">
                {data.receiptNumber}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Date & Time Verified
              </span>
              <p className="text-xs font-semibold text-foreground">
                {formattedDate}
              </p>
            </div>
          </div>

          {/* Payor & Reference Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium">Payor Name</span>
              <p className="font-bold text-foreground truncate">{data.payerName}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium">Student / User ID</span>
              <p className="font-mono font-semibold text-foreground">{data.studentId}</p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium">Request Reference</span>
              <p className="font-mono font-semibold text-foreground truncate">
                {data.requestReferenceNumber}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium">Payment Channel</span>
              <p className="font-semibold text-foreground">{data.paymentMethodLabel}</p>
            </div>
            {data.transactionReference && (
              <div className="col-span-2 space-y-1">
                <span className="text-muted-foreground font-medium">
                  Transaction / Payment Ref No.
                </span>
                <p className="font-mono text-xs font-semibold text-foreground truncate">
                  {data.transactionReference}
                </p>
              </div>
            )}
          </div>

          {/* Itemized Assessment Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="py-2 px-3 text-left font-bold text-muted-foreground">
                    Document Assessment
                  </th>
                  <th className="py-2 px-3 text-center font-bold text-muted-foreground">
                    Qty
                  </th>
                  <th className="py-2 px-3 text-right font-bold text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-foreground">{data.documentTitle}</p>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      {data.purpose}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-medium text-foreground">
                    {data.copies}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-foreground">
                    {data.amountPaidFormatted}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-muted/30 border-t font-semibold">
                <tr>
                  <td colSpan={2} className="py-2 px-3 text-right text-xs">
                    Total Settled:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-sm font-extrabold text-primary">
                    {data.amountPaidFormatted}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Audited Stamp / Security Footer */}
          <div className="flex items-center justify-between border-t pt-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified By: <strong className="text-foreground">{data.verifyingOfficer}</strong></span>
            </div>
            <span className="italic text-[10px]">Official System Stamp</span>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 font-semibold cursor-pointer"
          >
            <Printer className="size-4" />
            Print Receipt
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OfficialReceiptDialog;
