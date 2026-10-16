import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CredentialsFieldsProps = {
  firstName: string;
  setFirstName: Dispatch<SetStateAction<string>>;
  middleInitial: string;
  setMiddleInitial: Dispatch<SetStateAction<string>>;
  lastName: string;
  setLastName: Dispatch<SetStateAction<string>>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  confirmPassword: string;
  setConfirmPassword: Dispatch<SetStateAction<string>>;
};

function CredentialsFields({
  firstName,
  setFirstName,
  middleInitial,
  setMiddleInitial,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
}: CredentialsFieldsProps) {
  return (
    <div className="space-y-4" data-purpose="core-credentials">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        Personal &amp; Security Credentials
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <Label className="mb-1 block text-sm font-semibold" htmlFor="first-name">
            First Name
          </Label>
          <Input
            id="first-name"
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Juan"
            required
            value={firstName}
          />
        </div>
        <div className="sm:col-span-1">
          <Label className="mb-1 block text-sm font-semibold" htmlFor="middle-initial">
            M.I.
          </Label>
          <Input
            className="text-center uppercase"
            id="middle-initial"
            maxLength={2}
            onChange={(e) => setMiddleInitial(e.target.value)}
            placeholder="e.g. M"
            value={middleInitial}
          />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1 block text-sm font-semibold" htmlFor="last-name">
            Last Name
          </Label>
          <Input
            id="last-name"
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Benerao"
            required
            value={lastName}
          />
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <Label className="text-sm font-semibold" htmlFor="institutional-email">
            Institutional Email Address
          </Label>
          <span className="text-sm text-muted-foreground">
            Must be official university domain
          </span>
        </div>
        <Input
          id="institutional-email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="juan.dela.cruz@university.edu.ph"
          required
          type="email"
          value={email}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <Label className="mb-1 block text-sm font-semibold" htmlFor="password">
            Password
          </Label>
          <Input
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
        <div>
          <Label className="mb-1 block text-sm font-semibold" htmlFor="confirm-password">
            Confirm Password
          </Label>
          <Input
            id="confirm-password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </div>
      </div>
    </div>
  );
}

export default CredentialsFields;