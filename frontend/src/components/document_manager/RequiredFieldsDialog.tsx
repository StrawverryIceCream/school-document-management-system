import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import { useState } from "react";
import type { DocumentType } from "@/types";

interface Field {
  label: string;
  type: string;
  required: boolean;
}

function RequiredFieldsDialog({
  setNewDocument,
}: {
  setNewDocument: (value: DocumentType | null) => void;
}) {
  const [fields, setFields] = useState<Field[]>([]);
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    required: true,
  });

  function handleAddField() {
    if (!newField.label.trim()) return;

    setFields((prev) => [
      ...prev,
      { ...newField, label: newField.label.trim() },
    ]);

    setNewField({
      label: "",
      type: "text",
      required: true,
    });
  }

  return (
    <Field>
      <div className="flex items-center justify-between">
        <Label>Required fields</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddField}
        >
          <Plus className="w-3.5 h-3.5" />
          Add field
        </Button>
      </div>

      <div className="flex items-start gap-2 rounded-lg border p-2.5">
        <div className="flex-1 space-y-2">
          <Input
            placeholder="Field label (e.g. School Year)"
            value={newField.label}
            onChange={(e) =>
              setNewField((prev) => ({ ...prev, label: e.target.value }))
            }
          />

          <div className="flex items-center gap-3">
            <Select
              value={newField.type}
              onValueChange={(value) =>
                setNewField((prev) => ({ ...prev, type: value }))
              }
            >
              <SelectTrigger className="w-35">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="file">File upload</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                defaultChecked
                checked={newField.required}
                onCheckedChange={(checked) =>
                  setNewField((prev) => ({ ...prev, required: checked }))
                }
              />
              <span className="text-sm text-muted-foreground">Required</span>
            </div>
          </div>
        </div>

        <Button type="button" variant="ghost" size="icon">
          <Trash2 className="w-4 h-4 text-destructive" />
        </Button>
      </div>
      {fields.map((field) => (
        <div key={field.label} className="flex items-center gap-2">
          <div className="flex flex-1 items-center justify-between rounded-lg border p-3">
            <Label htmlFor="isActive">{field.label}</Label>
            <p className="text-sm text-muted-foreground">{field.type}</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ))}
      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No fields yet — add one if requesters need to provide extra info (e.g.
          school year, purpose).
        </p>
      )}
    </Field>
  );
}

export default RequiredFieldsDialog;
