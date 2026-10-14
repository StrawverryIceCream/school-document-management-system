import {
  ArrowRight,
  Banknote,
  CreditCard,
  Landmark,
  Smartphone,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TONES } from "@/lib/tones";

interface PaymentRequiredProps {
  method: "online" | "cash";
  onMethodChange: (method: "online" | "cash") => void;
}

const ONLINE_METHODS: {
  label: string;
  icon: typeof Smartphone;
}[] = [
  { label: "GCash", icon: Wallet },
  { label: "Maya", icon: Smartphone },
  { label: "Bank Transfer", icon: Landmark },
  { label: "Card", icon: CreditCard },
];

function PaymentRequired({
  method,
  onMethodChange,
}: PaymentRequiredProps) {
  return (
    <Card className="gap-4 rounded-xl border-0 p-4 shadow-sm sm:p-5">
      <CardHeader className="flex-row items-center justify-between gap-3 p-0">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Section A
          </p>
          <CardTitle className="mt-1 text-lg">Settlement Method</CardTitle>
        </div>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-sm font-semibold",
            TONES.brand.badge,
          )}
        >
          <span className={cn("mr-1.5 size-1.5 rounded-full", TONES.brand.dot)} />
          Staff review
        </span>
      </CardHeader>
      <CardContent className="space-y-3 p-0">
        <div
          className={cn(
            "rounded-lg border p-3 transition-colors sm:p-4",
            method === "online"
              ? "border-primary/30 bg-muted"
              : "border-border bg-muted/50",
          )}
        >
          <button
            type="button"
            aria-pressed={method === "online"}
            onClick={() => onMethodChange("online")}
            className="flex w-full items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              className={cn(
                "mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border",
                method === "online"
                  ? "border-foreground"
                  : "border-muted-foreground/50",
              )}
            >
              {method === "online" && (
                <span className="size-1.5 rounded-full bg-foreground" />
              )}
            </span>
            <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
              <span>
                <span className="block text-base font-semibold sm:text-lg">
                  Online Digital Payment
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  Upload your receipt after payment for staff verification.
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1.5 text-sm font-semibold",
                  TONES.sky.badge,
                )}
              >
                <span className="inline-flex items-center gap-1">
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                  Online
                </span>
              </span>
            </span>
          </button>
          <div className="mt-3 rounded-lg border bg-card p-2.5 sm:p-3">
            <span className="block text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Available payment methods
            </span>
            <span className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
              {ONLINE_METHODS.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-md bg-muted/50 px-1.5 text-center text-sm"
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </span>
              ))}
            </span>
          </div>
        </div>

        <button
          type="button"
          aria-pressed={method === "cash"}
          onClick={() => onMethodChange("cash")}
          className={cn(
            "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4",
            method === "cash"
              ? "border-primary/30 bg-muted"
              : "border-border bg-muted/50 hover:bg-muted",
          )}
        >
          <span
            className={cn(
              "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
              method === "cash"
                ? "border-foreground"
                : "border-muted-foreground/50",
            )}
          >
            {method === "cash" && (
              <span className="size-1.5 rounded-full bg-foreground" />
            )}
          </span>
          <span className="flex min-w-0 flex-1 items-start justify-between gap-3">
            <span>
              <span className="flex items-center gap-2 text-base font-semibold sm:text-lg">
                <Banknote className="size-4 text-muted-foreground" aria-hidden="true" />
                Over-the-Counter Cashier
              </span>
              <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                Pay at the cashier, then upload a photo or scan of your receipt.
              </span>
            </span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1.5 text-sm font-semibold",
                TONES.amber.badge,
              )}
            >
              Cashier
            </span>
          </span>
        </button>
      </CardContent>
    </Card>
  );
}

export default PaymentRequired;
