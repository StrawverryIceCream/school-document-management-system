import type { Dispatch, SetStateAction } from "react";
import { AlertTriangle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
          "mb-4 flex items-start gap-3 rounded-xl border p-3.5 text-sm leading-relaxed",
          TONES[COMPLIANCE_NOTICE_TONE].badge,
        )}
      >
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="flex flex-col gap-1 text-xs sm:text-sm">
          <p className="font-semibold text-foreground">
            Official Academic Integrity Policy
          </p>
          <p className="opacity-90 leading-relaxed">
            All records are validated against cryptographic university registrar hashes.
            Falsification of student numbers or institutional identity triggers
            automatic account restriction and Dean referral.
          </p>
        </div>
      </div>
      <label
        htmlFor="data-privacy-consent"
        className="flex items-start gap-2.5 cursor-pointer select-none"
      >
        <Checkbox
          checked={agreedToPolicy}
          id="data-privacy-consent"
          onCheckedChange={(checked) => setAgreedToPolicy(checked === true)}
          className="mt-0.5 shrink-0"
        />
        <span className="text-xs sm:text-sm font-normal leading-relaxed text-muted-foreground">
          I agree to the{" "}
          <a
            className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            University Data Privacy Policy
          </a>{" "}
          and certify that all entered identity information corresponds to my
          legal academic standing.
        </span>
      </label>
    </div>
  );
}

export default ComplianceNotice;
