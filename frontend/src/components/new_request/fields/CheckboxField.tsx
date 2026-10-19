// frontend/src/components/new_request/fields/CheckboxField.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { BaseFieldProps } from "./types";

export function CheckboxField({
  id,
  label,
  value,
  onChange,
  helperText,
  disabled,
}: BaseFieldProps<boolean>) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer",
        value && "border-primary/50 bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Checkbox
        id={id}
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked === true)}
        disabled={disabled}
        className="mt-0.5"
      />
      <div className="flex flex-col select-none">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {helperText && (
          <span className="text-xs text-muted-foreground mt-0.5">{helperText}</span>
        )}
      </div>
    </label>
  );
}
