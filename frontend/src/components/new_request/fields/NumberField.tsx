// frontend/src/components/new_request/fields/NumberField.tsx
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BaseFieldProps } from "./types";

interface NumberFieldProps extends BaseFieldProps<number> {
  min?: number;
  max?: number;
  step?: number;
  unitPriceLabel?: string;
}

export function NumberField({
  id,
  label,
  required,
  value,
  onChange,
  min = 1,
  max = 10,
  helperText,
  error,
  disabled,
  unitPriceLabel,
}: NumberFieldProps) {
  const currentVal = typeof value === "number" && !Number.isNaN(value) ? value : min;

  function handleDecrement() {
    if (currentVal > min) onChange(currentVal - 1);
  }

  function handleIncrement() {
    if (currentVal < max) onChange(currentVal + 1);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <div className="flex items-center rounded-lg border bg-muted/40 p-1 w-fit gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-md bg-card shadow-sm hover:bg-muted"
          onClick={handleDecrement}
          disabled={disabled || currentVal <= min}
          aria-label="Decrease value"
        >
          <Minus className="size-4" />
        </Button>
        <Input
          id={id}
          type="number"
          min={min}
          max={max}
          value={currentVal}
          disabled={disabled}
          onChange={(e) => {
            const next = e.target.valueAsNumber;
            if (!Number.isNaN(next)) {
              onChange(Math.max(min, Math.min(max, next)));
            }
          }}
          className="w-14 border-0 bg-transparent text-center font-bold shadow-none focus-visible:ring-0"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 rounded-md bg-card shadow-sm hover:bg-muted"
          onClick={handleIncrement}
          disabled={disabled || currentVal >= max}
          aria-label="Increase value"
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {unitPriceLabel && (
        <span className="text-xs text-muted-foreground">{unitPriceLabel}</span>
      )}
      {helperText && !error && !unitPriceLabel && (
        <span className="text-xs text-muted-foreground">{helperText}</span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
