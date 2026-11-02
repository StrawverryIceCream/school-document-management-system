import { CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ROLE_OPTIONS } from "@/lib/auth/arch-registration";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

type RegistrationRole = Extract<UserRole, "student" | "teacher">;

type RoleSelectorProps = {
  role: RegistrationRole;
  onRoleChange: (role: RegistrationRole) => void;
};

function RoleSelector({ role, onRoleChange }: RoleSelectorProps) {
  const handleKeyDown = (e: React.KeyboardEvent, currentIdx: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = (currentIdx + 1) % ROLE_OPTIONS.length;
      onRoleChange(ROLE_OPTIONS[nextIdx].role);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIdx = (currentIdx - 1 + ROLE_OPTIONS.length) % ROLE_OPTIONS.length;
      onRoleChange(ROLE_OPTIONS[prevIdx].role);
    }
  };

  return (
    <div data-purpose="role-selection-section">
      <Label className="mb-3 block text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Select Identity &amp; Account Category
      </Label>
      <div
        aria-label="Account Role"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        role="radiogroup"
      >
        {ROLE_OPTIONS.map(({ role: optionRole, label, description, icon: Icon }, index) => {
          const selected = role === optionRole;
          return (
            <button
              key={optionRole}
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "relative flex items-start gap-3.5 rounded-xl border-2 p-4 text-start transition-all cursor-pointer",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden",
                selected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/30",
              )}
              onClick={() => onRoleChange(optionRole)}
              role="radio"
              type="button"
            >
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg",
                  selected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon aria-hidden="true" className="size-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-foreground">
                    {label}
                  </span>
                  {selected && (
                    <CheckCircle2
                      aria-hidden="true"
                      className="size-5 shrink-0 text-primary"
                    />
                  )}
                </div>
                <p className="mt-1 text-base leading-normal text-muted-foreground">
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RoleSelector;
