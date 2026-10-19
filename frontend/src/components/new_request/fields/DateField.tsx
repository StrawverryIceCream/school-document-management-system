// frontend/src/components/new_request/fields/DateField.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BaseFieldProps } from "./types";

export function DateField({
  id,
  label,
  required,
  value,
  onChange,
  helperText,
  error,
  disabled,
}: BaseFieldProps<string>) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold flex items-center justify-between">
        <span>
          {label} {required && <span className="text-destructive">*</span>}
        </span>
      </Label>
      <Input
        id={id}
        type="date"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card cursor-pointer"
      />
      {helperText && !error && (
        <span className="text-xs text-muted-foreground">{helperText}</span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
