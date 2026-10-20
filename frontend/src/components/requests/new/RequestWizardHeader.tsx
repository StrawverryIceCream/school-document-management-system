import { ArrowRight, Check, ShieldCheck } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRequestWizard } from "@/hooks/useRequestWizard";
import { PROGRESS_MAX_PERCENT, REQUEST_WIZARD_STEPS } from "@/lib/requests";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function RequestWizardHeader() {
  const { id } = useParams<{ id?: string }>();
  const { currentStep } = useRequestWizard();

  const currentIndex = REQUEST_WIZARD_STEPS.findIndex(
    (step) => step.key === currentStep,
  );
  const progress =
    ((currentIndex + 1) / REQUEST_WIZARD_STEPS.length) * PROGRESS_MAX_PERCENT;

  return (
    <Card className="gap-8 rounded-3xl border-0 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex max-w-3xl flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className={cn(BADGE_BASE, TONES.brand.badge)}
            >
              Application Form
            </Badge>
            {/* The select page has no :id yet, so the reference only appears once a document is chosen */}
            {id && (
              <span className="text-sm font-medium text-muted-foreground">
                &bull; Registry Session #{id}
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Request an Official Document
          </h1>
          <p className="text-lg text-muted-foreground">
            Choose the credentials or certifications you need issued by the
            University Registrar, Student Affairs, or Human Resource Department.
          </p>
        </div>

        <Card className="flex-row items-start gap-3 rounded-2xl border-0 bg-muted px-5 py-4 shadow-none lg:min-w-72">
          <ShieldCheck
            className="mt-0.5 size-6 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="flex flex-col">
            <span className="text-sm font-bold uppercase tracking-wide text-foreground">
              Secure Portal
            </span>
            <span className="text-base text-muted-foreground">
              University Seal Guaranteed
            </span>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <ol className="grid gap-3 md:grid-cols-3" aria-label="Request steps">
          {REQUEST_WIZARD_STEPS.map((step, index) => {
            const isActive = index === currentIndex;
            const isDone = index < currentIndex;

            return (
              <li
                key={step.key}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-4 rounded-2xl px-5 py-4 text-lg font-semibold transition-colors",
                  isActive && "bg-primary text-primary-foreground",
                  !isActive && "bg-muted text-muted-foreground",
                  isDone && "text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    isActive ? "bg-primary-foreground/20" : "bg-card",
                  )}
                >
                  {isDone ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className="flex-1">
                  {index + 1}. {step.label}
                </span>
                {isActive && (
                  <ArrowRight className="size-5" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
        <Progress
          value={progress}
          aria-label="Request progress"
          className="h-2 bg-muted"
        />
      </div>
    </Card>
  );
}
