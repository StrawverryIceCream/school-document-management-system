// frontend/src/components/new_request/fields/TextareaField.tsx
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { BaseFieldProps } from "./types";

export function TextareaField({
  id,
  label,
  required,
  value,
  onChange,
  placeholder,
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
      <Textarea
        id={id}
        placeholder={placeholder}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="bg-card min-h-[90px]"
      />
      {helperText && !error && (
        <span className="text-xs text-muted-foreground">{helperText}</span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
