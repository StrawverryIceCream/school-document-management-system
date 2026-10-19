import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Lock, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DIVIDER_LABEL,
  IDENTIFIER_FIELD,
  LOADING_SUBMIT_LABEL,
  LOGIN_CARD,
  PASSWORD_FIELD,
  REMEMBER_OPTION,
  SIGN_UP,
  SSO_BUTTON_LABEL,
  SUBMIT_LABEL,
  TRACK_SLIP,
} from "@/lib/auth/login-card";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

type LoginCardProps = {
  error: string | null;
  loading: boolean;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  email: string;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
  password: string;
  setPassword: React.Dispatch<React.SetStateAction<string>>;
};

export default function LoginCard({
  error,
  loading,
  handleSubmit,
  email,
  setEmail,
  password,
  setPassword,
}: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  return (
    <Card className="relative gap-6 overflow-hidden rounded-2xl py-7 shadow-lg sm:py-9">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-primary via-primary/70 to-secondary"
      />

      <CardHeader className="gap-2 px-7 sm:px-9">
        <div className="flex items-center justify-between gap-3">
          <CardTitle
            role="heading"
            aria-level={2}
            className="text-3xl font-bold tracking-tight"
          >
            {LOGIN_CARD.title}
          </CardTitle>
          <Badge
            className={cn(
              BADGE_BASE,
              "shrink-0 border-transparent",
              TONES.emerald.badge,
            )}
          >
            {LOGIN_CARD.badge}
          </Badge>
        </div>
        <CardDescription className="text-base leading-normal">
          {LOGIN_CARD.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 px-7 sm:px-9">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-12 w-full gap-3 rounded-xl text-base font-semibold shadow-sm"
        >
          {/* lucide has no Google mark, so the brand logo is inlined with its own colors */}
          <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          {SSO_BUTTON_LABEL}
        </Button>

        <div className="relative flex items-center justify-center py-2">
          <Separator />
          <span className="absolute bg-card px-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            {DIVIDER_LABEL}
          </span>
        </div>

        <form
          aria-label={LOGIN_CARD.formAriaLabel}
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label
              htmlFor={IDENTIFIER_FIELD.id}
              className="text-sm font-semibold uppercase tracking-wider"
            >
              {IDENTIFIER_FIELD.label}
            </Label>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={IDENTIFIER_FIELD.id}
                name={IDENTIFIER_FIELD.name}
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={IDENTIFIER_FIELD.placeholder}
                className="h-11 rounded-xl pl-11 text-base md:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label
                htmlFor={PASSWORD_FIELD.id}
                className="text-sm font-semibold uppercase tracking-wider"
              >
                {PASSWORD_FIELD.label}
              </Label>
              <a
                href={PASSWORD_FIELD.forgotHref}
                className={cn(
                  "text-sm font-semibold hover:underline",
                  TONES.brand.value,
                )}
              >
                {PASSWORD_FIELD.forgotLabel}
              </a>
            </div>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id={PASSWORD_FIELD.id}
                name={PASSWORD_FIELD.name}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={PASSWORD_FIELD.placeholder}
                className="h-11 rounded-xl pl-11 pr-12 text-base md:text-base"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={
                  showPassword
                    ? PASSWORD_FIELD.hideLabel
                    : PASSWORD_FIELD.showLabel
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-1 top-1/2 size-9 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="size-5" aria-hidden="true" />
                ) : (
                  <Eye className="size-5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id={REMEMBER_OPTION.id}
                checked={remember}
                onCheckedChange={(checked) => setRemember(checked === true)}
              />
              <Label
                htmlFor={REMEMBER_OPTION.id}
                className="cursor-pointer text-base font-medium"
              >
                {REMEMBER_OPTION.label}
              </Label>
            </div>
            <span className="text-sm text-muted-foreground">
              {REMEMBER_OPTION.hint}
            </span>
          </div>

          <Button
            type="submit"
            size="lg"
            className="group h-12 w-full gap-2 rounded-xl text-base font-bold shadow-md"
            disabled={loading}
          >
            {loading ? LOADING_SUBMIT_LABEL : SUBMIT_LABEL}
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Button>
          {error && <p className="text-base text-destructive">{error}</p>}
        </form>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-5 px-7 sm:px-9">
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          {SIGN_UP.prompt}{" "}
          <a
            href={SIGN_UP.href}
            className={cn(
              "inline-flex items-center gap-1 font-bold hover:underline",
              TONES.brand.value,
            )}
          >
            {SIGN_UP.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-muted/50 p-3 text-sm">
          <span className="font-medium text-muted-foreground">
            {TRACK_SLIP.prompt}
          </span>
          <a
            href={TRACK_SLIP.href}
            className={cn(
              "inline-flex items-center gap-1 font-bold hover:underline",
              TONES.brand.value,
            )}
          >
            {TRACK_SLIP.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
