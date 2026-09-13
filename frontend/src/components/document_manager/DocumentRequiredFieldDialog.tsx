import { Settings2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { FieldGroup } from "../ui/field";
import { Label } from "../ui/label";
import type { RequiredFieldDefinition } from "@/types";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Selection" },
  { value: "checkbox", label: "Checkbox" },
] as const;

const STUDENT_INFO_KEYS = ["student-name", "student-course-section", "student-id"];

function DocumentRequiredFieldDialog({
  requiredFields,
  onFieldTypeChange,
}: {
  requiredFields: RequiredFieldDefinition[];
  onFieldTypeChange?: (key: string, newType: RequiredFieldDefinition["type"]) => void;
}) {
  const hasAllStudentInfo = STUDENT_INFO_KEYS.every((key) =>
    requiredFields.some((f) => f.key === key)
  );

  const customFields = requiredFields.filter(
    (f) => !STUDENT_INFO_KEYS.includes(f.key)
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Settings2 />
          <span>Required Fields</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <PopoverHeader>
          <PopoverTitle>Required Fields</PopoverTitle>
          <PopoverDescription>
            Configure fields required when submitting this document.
          </PopoverDescription>
        </PopoverHeader>
        <FieldGroup>
          {hasAllStudentInfo && (
            <div className="rounded-lg border p-3">
              <Label className="text-sm font-medium">Ask for Student Information</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Automatically adds Name, Course and Section, and Student ID
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Name</Label>
                  <Input value="Name" disabled className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Student ID</Label>
                  <Input value="Student ID" disabled className="h-8 text-xs" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Course and Section</Label>
                  <Input value="Course and Section" disabled className="h-8 text-xs" />
                </div>
              </div>
            </div>
          )}

          {customFields.map((field) => (
            <div key={field.key} className="flex items-center gap-2 rounded-lg border p-2">
              <Label className="flex items-center gap-2 whitespace-nowrap min-w-20">
                <span className="text-sm">{field.label}</span>
                {field.required && (
                  <span className="text-destructive text-xs font-semibold">
                    *
                  </span>
                )}
              </Label>
              <div className="flex items-center gap-2 flex-1 justify-end">
                {field.type === "select" && field.options && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    ({field.options.length})
                  </span>
                )}
                <Select
                  value={field.type}
                  onValueChange={(value) =>
                    onFieldTypeChange?.(field.key, value as RequiredFieldDefinition["type"])
                  }
                >
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}

          {customFields.length === 0 && !hasAllStudentInfo && (
            <p className="text-sm text-muted-foreground">
              No required fields for this document.
            </p>
          )}
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}

export default DocumentRequiredFieldDialog;