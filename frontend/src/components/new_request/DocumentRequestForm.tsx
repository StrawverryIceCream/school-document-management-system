// components/documents/DocumentRequestForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DocumentType, RequiredFieldValues } from "@/types";
import { Textarea } from "../ui/textarea";

type DocumentRequestFormProps = {
  document: DocumentType;
  onSubmit: (values: RequiredFieldValues) => Promise<void>;
};

function DocumentRequestForm({ document, onSubmit }: DocumentRequestFormProps) {
  const [values, setValues] = useState<RequiredFieldValues>({});
  const [submitting, setSubmitting] = useState(false);

  function setField(key: string, value: string | number | boolean) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
      <FieldGroup>
        <Field key="purpose">
          <FieldLabel htmlFor="purpose">Purpose</FieldLabel>
          <Textarea></Textarea>
        </Field>
        {document.requiredFields.map(
          (fieldDef) =>
            fieldDef.label !== "Purpose" && (
              <Field key={fieldDef.key}>
                <FieldLabel htmlFor={fieldDef.key}>{fieldDef.label}</FieldLabel>
                {fieldDef.type === "text" && (
                  <Input
                    id={fieldDef.key}
                    type="text"
                    required={fieldDef.required}
                    value={(values[fieldDef.key] as string) ?? ""}
                    onChange={(e) => setField(fieldDef.key, e.target.value)}
                  />
                )}
                {fieldDef.type === "number" && (
                  <Input
                    id={fieldDef.key}
                    type="number"
                    required={fieldDef.required}
                    value={(values[fieldDef.key] as number) ?? ""}
                    onChange={(e) =>
                      setField(fieldDef.key, e.target.valueAsNumber)
                    }
                  />
                )}
                {fieldDef.type === "date" && (
                  <Input
                    id={fieldDef.key}
                    type="date"
                    required={fieldDef.required}
                    value={(values[fieldDef.key] as string) ?? ""}
                    onChange={(e) => setField(fieldDef.key, e.target.value)}
                  />
                )}
                {fieldDef.type === "select" && (
                  <Select
                    value={(values[fieldDef.key] as string) ?? ""}
                    onValueChange={(value) => setField(fieldDef.key, value)}
                  >
                    <SelectTrigger id={fieldDef.key}>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      {fieldDef.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {fieldDef.type === "checkbox" && (
                  <Checkbox
                    id={fieldDef.key}
                    checked={(values[fieldDef.key] as boolean) ?? false}
                    onCheckedChange={(checked) =>
                      setField(fieldDef.key, checked === true)
                    }
                  />
                )}
              </Field>
            ),
        )}
      </FieldGroup>

      <Button type="submit" disabled={submitting} className="mt-6">
        {submitting ? "Submitting..." : "Submit Request"}
      </Button>
    </form>
  );
}

export default DocumentRequestForm;
