import { useState } from "react";
import { Link } from "react-router-dom";
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
  IDENTIFIER_FIELD,
  LOADING_SUBMIT_LABEL,
  LOGIN_CARD,
  PASSWORD_FIELD,
  REMEMBER_OPTION,
  SIGN_UP,
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

      <CardHeader className="gap-2 px-5 sm:px-9">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
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

      <CardContent className="space-y-5 px-5 sm:px-9">
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
                className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
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
                className="h-11 rounded-xl ps-11 text-base md:text-base"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-card-error" : undefined}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={PASSWORD_FIELD.id}
              className="text-sm font-semibold uppercase tracking-wider"
            >
              {PASSWORD_FIELD.label}
            </Label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute start-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
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
                className="h-11 rounded-xl ps-11 pe-12 text-base md:text-base"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-card-error" : undefined}
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
                className="absolute end-1 top-1/2 size-9 -translate-y-1/2 text-muted-foreground cursor-pointer"
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
            aria-busy={loading}
            className="group h-12 w-full gap-2 rounded-xl text-base font-bold shadow-md cursor-pointer"
            disabled={loading}
          >
            {loading ? LOADING_SUBMIT_LABEL : SUBMIT_LABEL}
            <ArrowRight
              className="size-5 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
              aria-hidden="true"
            />
          </Button>
          {error && (
            <p
              id="login-card-error"
              role="alert"
              aria-live="assertive"
              className="text-sm font-medium text-destructive"
            >
              {error}
            </p>
          )}
        </form>
      </CardContent>

      <CardFooter className="flex-col items-stretch gap-5 px-5 sm:px-9">
        <Separator />
        <p className="text-center text-sm text-muted-foreground">
          {SIGN_UP.prompt}{" "}
          <Link
            to={SIGN_UP.href}
            className={cn(
              "inline-flex items-center gap-1 font-bold hover:underline",
              TONES.brand.value,
            )}
          >
            {SIGN_UP.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border bg-muted/50 p-3 text-sm">
          <span className="font-medium text-muted-foreground">
            {TRACK_SLIP.prompt}
          </span>
          <Link
            to={TRACK_SLIP.href}
            className={cn(
              "inline-flex items-center gap-1 font-bold hover:underline",
              TONES.brand.value,
            )}
          >
            {TRACK_SLIP.label}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
