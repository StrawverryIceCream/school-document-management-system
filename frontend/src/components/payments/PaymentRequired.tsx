import { ArrowRight, Banknote } from "lucide-react";
import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TONES } from "@/lib/tones";

interface PaymentRequiredProps {
  method: "online" | "cash" | null;
  onMethodChange: (method: "online" | "cash") => void;
  onlineContent: ReactNode;
  cashContent: ReactNode;
}

function PaymentRequired({
  method,
  onMethodChange,
  onlineContent,
  cashContent,
}: PaymentRequiredProps) {
  return (
    <Card className="min-w-0 gap-4 overflow-visible rounded-xl border-0 p-4 shadow-sm sm:p-5">
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
      <CardContent className="min-w-0 space-y-3 p-0">
        <Accordion
          type="single"
          value={method ?? ""}
          collapsible={false}
          onValueChange={(value) => {
            if (value === "online" || value === "cash") {
              onMethodChange(value);
            }
          }}
          className="gap-2"
        >
          <AccordionItem
            value="online"
            className={cn(
              "min-w-0 rounded-lg border p-3 transition-colors sm:p-4",
              method === "online"
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card hover:bg-muted/30",
            )}
          >
            <AccordionTrigger
              className="rounded-lg border-0 p-0 transition-colors hover:no-underline"
            >
              <span className="flex min-w-0 flex-1 items-start gap-3">
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
              </span>
            </AccordionTrigger>
            <AccordionContent className="min-w-0 pt-3 pb-0 motion-reduce:animate-none">
              {onlineContent}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="cash"
            className={cn(
              "min-w-0 rounded-lg border p-3 transition-colors sm:p-4",
              method === "cash"
                ? "border-primary/30 bg-primary/5"
                : "border-border bg-card hover:bg-muted/30",
            )}
          >
            <AccordionTrigger
              className="rounded-lg border-0 p-0 transition-colors hover:no-underline"
            >
              <span className="flex min-w-0 flex-1 items-start gap-3 text-left">
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
              </span>
            </AccordionTrigger>
            <AccordionContent className="min-w-0 pt-3 pb-0 motion-reduce:animate-none">
              {cashContent}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {!method && (
          <p className="text-sm text-muted-foreground" role="status">
            Please select a payment method to continue.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default PaymentRequired;
