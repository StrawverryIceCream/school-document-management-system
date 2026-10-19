// frontend/src/components/new_request/ApplicantDeclarationCard.tsx
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

interface ApplicantDeclarationCardProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ApplicantDeclarationCard({
  checked,
  onChange,
  disabled,
}: ApplicantDeclarationCardProps) {
  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <label className="flex items-start gap-3.5 cursor-pointer">
        <Checkbox
          id="compliance-oath"
          checked={checked}
          onCheckedChange={(val) => onChange(val === true)}
          disabled={disabled}
          className="mt-1 size-4"
        />
        <div className="flex flex-col select-none">
          <span className="text-sm font-bold text-foreground">
            Institutional Compliance & Truthfulness Oath
          </span>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            I hereby certify under penalty of administrative sanction that all
            information provided is accurate and true. I understand that
            falsification of academic records or misrepresentation of intent is
            subject to university disciplinary action and legal prosecution under
            Republic Act No. 10173 (Data Privacy Act of 2012).
          </p>
        </div>
      </label>
    </Card>
  );
}
