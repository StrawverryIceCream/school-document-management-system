// frontend/src/components/new_request/DeliveryMethodCard.tsx
import { Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

export type DeliveryMethod = "pickup" | "representative" | "courier";

interface DeliveryMethodCardProps {
  value: DeliveryMethod;
  onChange: (method: DeliveryMethod) => void;
  disabled?: boolean;
}

export default function DeliveryMethodCard({
  value,
  onChange,
  disabled,
}: DeliveryMethodCardProps) {
  const options = [
    {
      id: "pickup",
      title: "Campus Window Pickup (Registrar Main Hall)",
      badge: "Recommended",
      badgeTone: TONES.emerald.badge,
      desc: "Direct handoff upon presentation of mobile QR voucher and University Student ID",
      feeLabel: "Free of Charge",
      feeColor: "text-emerald-600 dark:text-emerald-400 font-bold",
    },
    {
      id: "representative",
      title: "Authorized Representative Pickup",
      badge: null,
      badgeTone: null,
      desc: "Requires formal signed Authorization Letter and Photocopy of valid IDs",
      feeLabel: "₱0.00",
      feeColor: "text-foreground font-semibold",
    },
  ] as const;

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2.5 pb-1">
        <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Truck className="size-4" />
        </span>
        <div>
          <h2 className="text-base font-bold text-foreground">
            Delivery & Releasing Method
          </h2>
          <span className="text-xs text-muted-foreground">
            Select how you intend to receive the authenticated credentials
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          return (
            <label
              key={opt.id}
              className={cn(
                "flex items-start gap-3.5 p-4 rounded-xl border bg-muted/20 hover:bg-muted/50 cursor-pointer transition-all",
                isSelected && "border-primary/60 bg-primary/5 ring-1 ring-primary/20",
                disabled && "pointer-events-none opacity-50",
              )}
            >
              <input
                type="radio"
                name="delivery_method"
                value={opt.id}
                checked={isSelected}
                disabled={disabled}
                onChange={() => onChange(opt.id as DeliveryMethod)}
                className="mt-1 text-primary focus:ring-primary size-4"
              />
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {opt.title}
                    </span>
                    {opt.badge && (
                      <Badge variant="secondary" className={cn(BADGE_BASE, opt.badgeTone)}>
                        {opt.badge}
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {opt.desc}
                  </span>
                </div>
                <span className={cn("text-sm self-start sm:self-auto shrink-0", opt.feeColor)}>
                  {opt.feeLabel}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </Card>
  );
}
