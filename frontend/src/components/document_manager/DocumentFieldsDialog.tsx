import type { DocumentType } from "@/types";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

function DocumentFieldsDialog({
  setNewDocument,
}: {
  setNewDocument: (value: DocumentType | null) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" placeholder="TOR" />
        </Field>

        <Field>
          <Label htmlFor="fee">Fee (₱)</Label>
          <Input
            id="fee"
            name="fee"
            type="number"
            step="0.01"
            placeholder="0.00"
          />
        </Field>
      </div>

      <Field>
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" placeholder="Transcript of Records" />
      </Field>

      <Field>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description shown to requesters"
        />
      </Field>

      <Field className="">
        <div className="space-y-0.5">
          <Label htmlFor="isActive">Active</Label>
          <p className="text-sm text-muted-foreground">
            Inactive documents can&apos;t be requested by students.
          </p>
        </div>
        <Switch id="isActive" name="isActive" defaultChecked />
      </Field>
    </>
  );
}

export default DocumentFieldsDialog;
