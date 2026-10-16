import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  INTRO_DESCRIPTION,
  INTRO_HEADING_ID,
  INTRO_NOTICE,
  INTRO_PILL,
  INTRO_STATS,
  INTRO_TITLE,
} from "@/lib/login/login-intro";
import { BADGE_BASE, ICON_BOX_BASE, TONES, VALUE_BASE } from "@/lib/tones";
import { cn } from "@/lib/utils";

export default function LoginIntro() {
  return (
    <section
      aria-labelledby={INTRO_HEADING_ID}
      className="flex flex-col justify-center space-y-6"
    >
      <Badge
        className={cn(
          BADGE_BASE,
          "self-start border-transparent",
          TONES.neutral.badge,
        )}
      >
        <span
          className={cn("size-2 rounded-full", TONES[INTRO_PILL.dotTone].dot)}
          aria-hidden="true"
        />
        {INTRO_PILL.label}
      </Badge>

      <div className="space-y-3">
        <h1
          id={INTRO_HEADING_ID}
          className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl"
        >
          {INTRO_TITLE.lead}{" "}
          <span className={TONES.brand.value}>{INTRO_TITLE.accent}</span>
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {INTRO_DESCRIPTION}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
        {INTRO_STATS.map(({ id, label, value, caption, tone }) => (
          <Card key={id} className="gap-0 rounded-xl py-3">
            <CardContent className="space-y-1 px-3">
              <span className="block text-sm font-medium text-muted-foreground">
                {label}
              </span>
              <p
                className={cn(
                  VALUE_BASE,
                  "text-lg leading-tight",
                  TONES[tone].value,
                )}
              >
                {value}
              </p>
              <span className="block text-sm leading-tight text-muted-foreground">
                {caption}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/90 py-4">
        <CardContent className="flex items-start gap-3 px-4">
          <div
            className={cn(ICON_BOX_BASE, "size-9 rounded-lg", TONES.amber.icon)}
          >
            <Info className="size-5" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <p className="text-base font-bold text-foreground">
              {INTRO_NOTICE.title}
            </p>
            <p>{INTRO_NOTICE.body}</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
