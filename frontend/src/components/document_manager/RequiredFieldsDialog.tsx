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
import type { NewDocument, RequiredFieldDefinition } from "@/types";


function RequiredFieldsDialog({
  setNewDocument,
}: {
  setNewDocument: React.Dispatch<React.SetStateAction<NewDocument | null>>;
}) {
  const [fields, setFields] = useState<RequiredFieldDefinition[]>([]);


   const syncFields = (nextFields: RequiredFieldDefinition[]) => {
    setFields(nextFields);

    setNewDocument((prev) => ({
      code: prev?.code ?? "",
      name: prev?.name ?? "",
      description: prev?.description ?? "",
      fee: prev?.fee ?? "0",
      isActive: prev?.isActive ?? true,
      requiredFields: nextFields,
    }));
  };

  function handleAddField() {
    const field: RequiredFieldDefinition = {
      key: `field-${Date.now()}`,
      label: "",
      type: "text",
      required: true,
    };
    syncFields([...fields, field]);
  }

  function handleUpdateField(key: string, updates: Partial<RequiredFieldDefinition>) {
    syncFields(fields.map((f) => (f.key === key ? { ...f, ...updates } : f)));
  }

  function handleRemoveField(key: string) {
    syncFields(fields.filter((f) => f.key !== key));
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

      {fields.map((field) => (
        <div key={field.key} className="flex items-start gap-2 rounded-lg border p-2.5">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Field label (e.g. School Year)"
              value={field.label}
              onChange={(e) => handleUpdateField(field.key, { label: e.target.value })}
            />

            <div className="flex items-center gap-3">
              <Select
                value={field.type}
                onValueChange={(value) =>
                  handleUpdateField(field.key, {
                    type: value as RequiredFieldDefinition["type"],
                  })
                }
              >
                <SelectTrigger className="w-35">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Switch
                  checked={field.required}
                  onCheckedChange={(checked) => handleUpdateField(field.key, { required: checked })}
                />
                <span className="text-sm text-muted-foreground">Required</span>
              </div>
            </div>
          </div>

          <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveField(field.key)}>
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
