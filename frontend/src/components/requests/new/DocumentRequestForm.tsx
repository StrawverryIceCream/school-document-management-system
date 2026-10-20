// frontend/src/components/new_request/DocumentRequestForm.tsx
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  FileCheck2,
  ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DocumentType, RequiredFieldValues } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { useRequestWizard } from "@/hooks/useRequestWizard";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";
import RequestWizardHeader from "./RequestWizardHeader";
import ApplicantProfileCard from "./ApplicantProfileCard";
import DeliveryMethodCard, { type DeliveryMethod } from "./DeliveryMethodCard";
import ApplicantDeclarationCard from "./ApplicantDeclarationCard";
import { DynamicFieldRenderer } from "./fields";

type DocumentRequestFormProps = {
  document: DocumentType;
  onSubmit: (values: RequiredFieldValues) => Promise<void>;
};

export default function DocumentRequestForm({
  document,
  onSubmit,
}: DocumentRequestFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setCurrentStep } = useRequestWizard();

  useEffect(() => {
    setCurrentStep("details");
  }, [setCurrentStep]);

  // Initial values pre-populated with student profile if field keys match
  const [values, setValues] = useState<RequiredFieldValues>(() => {
    const initial: RequiredFieldValues = {};
    for (const field of document.requiredFields) {
      const lowerKey = field.key.toLowerCase();
      const lowerLabel = field.label.toLowerCase();

      if (lowerKey === "student-name" || lowerLabel.includes("student name")) {
        initial[field.key] = user?.fullName || "";
      } else if (lowerKey === "student-id" || lowerLabel.includes("student id")) {
        initial[field.key] = user?.studentId || "";
      } else if (
        lowerKey === "student-course-section" ||
        lowerLabel.includes("course")
      ) {
        initial[field.key] = user?.department || "";
      } else if (field.type === "number") {
        initial[field.key] = 1;
      } else if (field.type === "checkbox") {
        initial[field.key] = false;
      } else {
        initial[field.key] = "";
      }
    }
    return initial;
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("pickup");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFieldChange(key: string, val: string | number | boolean) {
    setValues((prev) => ({ ...prev, [key]: val }));
    if (validationError) setValidationError(null);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setValidationError(null);

    // Validate required fields
    for (const field of document.requiredFields) {
      if (field.required) {
        const val = values[field.key];
        const isEmpty =
          val === undefined ||
          val === null ||
          (typeof val === "string" && val.trim() === "");
        if (isEmpty) {
          setValidationError(`Please fill out "${field.label}".`);
          return;
        }
      }
    }

    if (!declarationAccepted) {
      setValidationError("Please accept the compliance oath before proceeding.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col gap-6">
        <RequestWizardHeader />

        {/* Document Header Card */}
        <Card className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <BookOpen className="size-3.5" />
              <span>Registry Form Engine</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Document Details: {document.name}
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {document.description ||
                "Complete the required institutional fields and verification parameters for issuance."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={cn(BADGE_BASE, TONES.brand.badge)}>
              {document.office}
            </Badge>
            <Badge variant="secondary" className={cn(BADGE_BASE, TONES.sky.badge)}>
              <Clock className="size-3 mr-1" />
              {document.processingDays} {document.processingDays === 1 ? "day" : "days"} turnaround
            </Badge>
          </div>
        </Card>

        {/* Main Content Layout */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section A: Applicant Profile */}
          <ApplicantProfileCard />

          {/* Section B: Dynamic Document Fields */}
          <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 flex flex-col gap-5">
            <div className="flex items-center gap-2.5 pb-1">
              <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <FileCheck2 className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Registry Evaluation Parameters
                </h2>
                <span className="text-xs text-muted-foreground">
                  Fields rendered dynamically from document type specification
                </span>
              </div>
            </div>

            {document.requiredFields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {document.requiredFields.map((field) => (
                  <div
                    key={field.key}
                    className={cn(
                      field.type === "textarea" ||
                        field.label.toLowerCase().includes("purpose")
                        ? "md:col-span-2"
                        : "col-span-1",
                    )}
                  >
                    <DynamicFieldRenderer
                      field={field}
                      value={values[field.key]}
                      onChange={handleFieldChange}
                      disabled={submitting}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No additional custom fields required for this document. Standard registry records will be referenced.
              </div>
            )}
          </Card>

          {/* Section C: Delivery Method */}
          <DeliveryMethodCard
            value={deliveryMethod}
            onChange={setDeliveryMethod}
            disabled={submitting}
          />

          {/* Section E: Applicant Declaration */}
          <ApplicantDeclarationCard
            checked={declarationAccepted}
            onChange={setDeclarationAccepted}
            disabled={submitting}
          />

          {/* Validation Alert */}
          {validationError && (
            <div className="flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
              <ShieldAlert className="size-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Bottom Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => navigate("/new-request")}
              disabled={submitting}
            >
              <ArrowLeft className="size-4" />
              Back to Document Selection
            </Button>

            <Button
              type="submit"
              className="gap-2"
              disabled={submitting}
            >
              <span>{submitting ? "Processing..." : "Proceed to Payment & Verification"}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
