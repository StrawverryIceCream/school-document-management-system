// frontend/src/components/new_request/fields/DynamicFieldRenderer.tsx
import { TextField } from "./TextField";
import { TextareaField } from "./TextareaField";
import { NumberField } from "./NumberField";
import { DateField } from "./DateField";
import { SelectField } from "./SelectField";
import { CheckboxField } from "./CheckboxField";
import { FileField } from "./FileField";
import type { DynamicFieldRendererProps } from "./types";

export function DynamicFieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled,
}: DynamicFieldRendererProps) {
  const { key, label, type, required, options } = field;

  switch (type) {
    case "text":
      return (
        <TextField
          id={key}
          label={label}
          required={required}
          value={String(value ?? "")}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
    case "textarea":
      return (
        <TextareaField
          id={key}
          label={label}
          required={required}
          value={String(value ?? "")}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
    case "number":
      return (
        <NumberField
          id={key}
          label={label}
          required={required}
          value={typeof value === "number" ? value : Number(value) || 1}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
    case "date":
      return (
        <DateField
          id={key}
          label={label}
          required={required}
          value={String(value ?? "")}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
    case "select":
      return (
        <SelectField
          id={key}
          label={label}
          required={required}
          options={options ?? []}
          value={String(value ?? "")}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
    case "checkbox":
      return (
        <CheckboxField
          id={key}
          label={label}
          value={Boolean(value)}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
    case "file":
      return (
        <FileField
          id={key}
          label={label}
          required={required}
          value={String(value ?? "")}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
    default:
      return (
        <TextField
          id={key}
          label={label}
          required={required}
          value={String(value ?? "")}
          onChange={(v) => onChange(key, v)}
          error={error}
          disabled={disabled}
        />
      );
  }
}
