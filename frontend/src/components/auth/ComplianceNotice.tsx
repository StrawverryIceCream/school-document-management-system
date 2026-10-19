import type { Dispatch, SetStateAction } from "react";
import { AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { COMPLIANCE_NOTICE_TONE } from "@/lib/auth/arch-registration";
import { TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

type ComplianceNoticeProps = {
  agreedToPolicy: boolean;
  setAgreedToPolicy: Dispatch<SetStateAction<boolean>>;
};

function ComplianceNotice({
  agreedToPolicy,
  setAgreedToPolicy,
}: ComplianceNoticeProps) {
  return (
    <div className="pt-2" data-purpose="terms-and-compliance">
      <div
        className={cn(
          "mb-4 flex items-start gap-2.5 rounded-xl border p-3.5 text-sm leading-relaxed",
          TONES[COMPLIANCE_NOTICE_TONE].badge,
        )}
      >
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          <strong>Official Academic Integrity Policy:</strong> All records are
          validated against cryptographic university registrar hashes.
          Falsification of student numbers or institutional identity triggers
          automatic account restriction and Dean referral.
        </span>
      </div>
      <div className="flex items-start gap-2.5">
        <Checkbox
          checked={agreedToPolicy}
          id="data-privacy-consent"
          onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
        />
        <Label
          className="text-sm font-normal leading-relaxed text-muted-foreground"
          htmlFor="data-privacy-consent"
        >
          I agree to the{" "}
          <a className="font-semibold text-primary underline" href="#">
            University Data Privacy Policy
          </a>{" "}
          and certify that all entered identity information corresponds to my
          legal academic standing.
        </Label>
      </div>
    </div>
  );
}

export default ComplianceNotice;