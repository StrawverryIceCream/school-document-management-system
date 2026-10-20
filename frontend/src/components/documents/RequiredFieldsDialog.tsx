import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import type { NewDocument, RequiredFieldDefinition } from "@/types";

const STUDENT_INFO_FIELDS = [
  { key: "student-name", label: "Name", type: "text" as const },
  { key: "student-course-section", label: "Course and Section", type: "text" as const },
  { key: "student-id", label: "Student ID", type: "text" as const },
];

function RequiredFieldsDialog({
  setNewDocument,
}: {
  setNewDocument: React.Dispatch<React.SetStateAction<NewDocument | null>>;
}) {
  const [fields, setFields] = useState<RequiredFieldDefinition[]>([]);
  const [askStudentInfo, setAskStudentInfo] = useState(false);

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

  function handleToggleStudentInfo(checked: boolean) {
    setAskStudentInfo(checked);
    if (checked) {
      const studentFields = STUDENT_INFO_FIELDS.map((f) => ({
        ...f,
        required: true,
      }));
      syncFields([...studentFields, ...fields]);
    } else {
      syncFields(fields.filter((f) => !STUDENT_INFO_FIELDS.some((s) => s.key === f.key)));
    }
  }

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

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label htmlFor="student-info" className="text-sm font-medium">
            Ask for Student Information
          </Label>
          <p className="text-xs text-muted-foreground">
            Automatically adds Name, Section, Course, and Student ID
          </p>
        </div>
        <Switch
          id="student-info"
          checked={askStudentInfo}
          onCheckedChange={handleToggleStudentInfo}
        />
      </div>

      {askStudentInfo && (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-sm font-medium">Student Information Fields</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input value="Name" disabled className="h-9 text-sm" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Student ID</Label>
              <Input value="Student ID" disabled className="h-9 text-sm" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground">Course and Section</Label>
              <Input value="Course and Section" disabled className="h-9 text-sm" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            All fields are required and text type
          </p>
        </div>
      )}

      {fields
        .filter((f) => !STUDENT_INFO_FIELDS.some((s) => s.key === f.key))
        .map((field) => (
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

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveField(field.key)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}

      {fields.filter((f) => !STUDENT_INFO_FIELDS.some((s) => s.key === f.key)).length === 0 && (
        <p className="text-sm text-muted-foreground">
          No custom fields yet — add one if requesters need to provide extra info (e.g.
          school year, purpose).
        </p>
      )}
    </Field>
  );
}

export default RequiredFieldsDialog;