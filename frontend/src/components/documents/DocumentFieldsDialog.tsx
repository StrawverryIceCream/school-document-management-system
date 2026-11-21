import type { NewDocument } from "@/types";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getOffices, type OfficeRecord } from "@/api/offices";
import type { UserCategory } from "@/types";
import { useEffect } from "react";

const DEFAULT_DOCUMENT_FORM: NewDocument = {
  code: "",
  name: "",
  description: "",
  fee: "",
  isActive: true,
  category: "student",
  allowedCategories: ["student"],
  processingDays: 3,
  maxCopies: 1,
  requiredFields: [],
};

const AUDIENCE_OPTIONS: { value: UserCategory; label: string }[] = [
  { value: "student", label: "Students" },
  { value: "teacher", label: "Teachers" },
  { value: "staff", label: "Staff" },
];

function DocumentFieldsDialog({
  setNewDocument,
  newDocument,
}: {
  setNewDocument: React.Dispatch<React.SetStateAction<NewDocument | null>>;
  newDocument: NewDocument | null;
}) {
  const [form, setForm] = useState<NewDocument>(() => ({
    ...DEFAULT_DOCUMENT_FORM,
    ...newDocument,
  }));
  const [offices, setOffices] = useState<OfficeRecord[]>([]);
  const [officesLoading, setOfficesLoading] = useState(true);
  const [officesError, setOfficesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getOffices()
      .then((data) => {
        if (!cancelled) {
          setOffices(data.filter((office) => office.isActive));
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error("Could not fetch offices:", err);
          setOfficesError(
            err instanceof Error ? err.message : "Could not load offices",
          );
        }
      })
      .finally(() => {
        if (!cancelled) setOfficesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof NewDocument>(
    key: K,
    value: NewDocument[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setNewDocument((prev) => ({
      ...DEFAULT_DOCUMENT_FORM,
      ...prev,
      [key]: value,
    }));
  };

  const updateAudience = (audience: UserCategory, checked: boolean) => {
    const currentAudiences =
      form.allowedCategories ?? [form.category ?? "student"];
    const allowedCategories = checked
      ? [...new Set([...currentAudiences, audience])]
      : currentAudiences.filter((category) => category !== audience);
    const category = allowedCategories[0] ?? form.category ?? "student";

    setForm((prev) => ({ ...prev, category, allowedCategories }));
    setNewDocument((prev) => ({
      ...DEFAULT_DOCUMENT_FORM,
      ...prev,
      category,
      allowedCategories,
    }));
  };

  const selectedAudiences =
    form.allowedCategories ?? [form.category ?? "student"];

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
        <Label htmlFor="responsible-office">Responsible office</Label>
        <Select
          value={form.officeId ?? ""}
          onValueChange={(officeId) => updateField("officeId", officeId)}
          disabled={officesLoading || offices.length === 0 || Boolean(officesError)}
        >
          <SelectTrigger id="responsible-office" className="w-full">
            <SelectValue
              placeholder={
                officesLoading ? "Loading offices..." : "Select an office"
              }
            />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {offices.map((office) => (
              <SelectItem key={office.id} value={office.id}>
                {office.code} — {office.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {officesError ? (
          <p className="text-sm text-destructive">{officesError}</p>
        ) : offices.length === 0 && !officesLoading ? (
          <p className="text-sm text-muted-foreground">
            No active offices are available.
          </p>
        ) : null}
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

      <div className="grid grid-cols-2 gap-3">
        <Field>
          <Label htmlFor="processingDays">Turnaround time (working days)</Label>
          <Input
            id="processingDays"
            name="processingDays"
            type="number"
            min={0}
            step={1}
            value={form.processingDays ?? 3}
            onChange={(e) =>
              updateField("processingDays", Number(e.target.value))
            }
          />
          <p className="text-xs text-muted-foreground">
            Enter 0 for same-day processing.
          </p>
        </Field>

        <Field>
          <Label htmlFor="maxCopies">Maximum copies</Label>
          <Input
            id="maxCopies"
            name="maxCopies"
            type="number"
            min={1}
            step={1}
            value={form.maxCopies ?? 1}
            onChange={(e) => updateField("maxCopies", Number(e.target.value))}
          />
        </Field>
      </div>

      <Field>
        <div className="space-y-0.5">
          <Label>Audience</Label>
          <p className="text-sm text-muted-foreground">
            Choose who can request this document.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {AUDIENCE_OPTIONS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedAudiences.includes(value)}
                onCheckedChange={(checked) =>
                  updateAudience(value, checked === true)
                }
              />
              {label}
            </label>
          ))}
        </div>
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
