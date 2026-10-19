import type { NewDocument } from "@/types";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

function DocumentFieldsDialog({
  setNewDocument,
}: {
  setNewDocument: React.Dispatch<React.SetStateAction<NewDocument | null>>;
}) {
  const [form, setForm] = useState<NewDocument>({
    code: "",
    name: "",
    description: "",
    fee: "",
    isActive: true,
    requiredFields: [],
  });

  const updateField = <K extends keyof NewDocument>(
    key: K,
    value: NewDocument[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setNewDocument((prev) => ({
      ...(prev ?? {
        code: "",
        name: "",
        description: "",
        fee: "",
        isActive: true,
        requiredFields: [],
      }),
      [key]: value,
    }));
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Label htmlFor="code">Code</Label>
          <Input
            id="code"
            name="code"
            placeholder="TOR"
            value={form.code}
            onChange={(e) => updateField("code", e.target.value)}
          />
        </Field>

        <Field>
          <Label htmlFor="fee">Fee (₱)</Label>
          <Input
            id="fee"
            name="fee"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={form.fee}
            onChange={(e) => updateField("fee", e.target.value)}
          />
        </Field>
      </div>

      <Field>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          placeholder="Transcript of Records"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
        />
      </Field>

      <Field>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description shown to requesters"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
        />
      </Field>

      <Field className="">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Active</Label>
          <p className="text-sm text-muted-foreground">
            Inactive documents can&apos;t be requested by students.
          </p>
        </div>
        <Switch
          id="isActive"
          name="isActive"
          checked={form.isActive}
          onCheckedChange={(checked) => updateField("isActive", checked)}
        />
      </Field>
    </>
  );
}

export default DocumentFieldsDialog;
