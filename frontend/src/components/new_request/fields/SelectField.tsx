// frontend/src/components/new_request/fields/SelectField.tsx
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BaseFieldProps } from "./types";

interface SelectFieldProps extends BaseFieldProps<string> {
  options?: string[];
}

export function SelectField({
  id,
  label,
  required,
  value,
  onChange,
  placeholder = "Select an option",
  options = [],
  helperText,
  error,
  disabled,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-semibold flex items-center justify-between">
        <span>
          {label} {required && <span className="text-destructive">*</span>}
        </span>
      </Label>
      <Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} className="bg-card w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {helperText && !error && (
        <span className="text-xs text-muted-foreground">{helperText}</span>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
