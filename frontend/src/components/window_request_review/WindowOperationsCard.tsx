import { Calendar, Store } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/window_request_review/format";
import type { RequestReviewDetails } from "@/api/requests";

interface WindowOperationsCardProps {
  request: RequestReviewDetails;
}

export function WindowOperationsCard({ request }: WindowOperationsCardProps) {
  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 space-y-4">
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-base font-bold text-foreground">
          Window Operations
        </h2>
        <Store className="size-4 text-muted-foreground" />
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Assigned Service Window
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {request.window?.name || "Window 1 (Registrar Evaluation Desk)"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border">
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Target Estimated Release
            </span>
            <span className="text-xs font-bold text-foreground mt-0.5">
              {request.releaseDate
                ? formatDate(request.releaseDate)
                : `${request.turnaroundDays} business days upon clearance`}
            </span>
          </div>
          <Calendar className="size-4 text-muted-foreground" />
        </div>
      </div>

      {/* QR Voucher Code Box */}
      <div className="p-4 rounded-xl bg-muted/30 border flex flex-col items-center justify-center text-center gap-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Window Claiming Code
        </span>
        <span className="text-sm font-mono font-bold tracking-wider text-foreground">
          {request.referenceNumber}
        </span>
        <div className="p-2 bg-card rounded-lg border shadow-xs my-1">
          <svg
            className="size-20 text-foreground"
            fill="currentColor"
            viewBox="0 0 100 100"
            aria-label="Claiming QR Code Voucher"
          >
            <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="6" width="28" x="10" y="10" />
            <rect height="8" width="8" x="20" y="20" />
            <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="6" width="28" x="62" y="10" />
            <rect height="8" width="8" x="72" y="20" />
            <rect fill="none" height="28" rx="2" stroke="currentColor" strokeWidth="6" width="28" x="10" y="62" />
            <rect height="8" width="8" x="20" y="72" />
            <rect height="8" width="8" x="46" y="15" />
            <rect height="8" width="8" x="46" y="32" />
            <rect height="8" width="8" x="62" y="48" />
            <rect height="8" width="8" x="76" y="62" />
            <rect height="18" width="8" x="46" y="62" />
            <rect height="8" width="18" x="20" y="46" />
          </svg>
        </div>
        <span className="text-[11px] text-muted-foreground">
          Scan at Window 1 Barcode Terminal during release
        </span>
      </div>
    </Card>
  );
}
