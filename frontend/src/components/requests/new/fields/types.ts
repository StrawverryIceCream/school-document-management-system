// frontend/src/components/new_request/fields/types.ts
import type { RequiredFieldDefinition } from "@/types";

export interface BaseFieldProps<T> {
  id: string;
  label: string;
  required?: boolean;
  value: T;
  onChange: (value: T) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

export interface DynamicFieldRendererProps {
  field: RequiredFieldDefinition;
  value: string | number | boolean;
  onChange: (key: string, value: string | number | boolean) => void;
  error?: string;
  disabled?: boolean;
}
