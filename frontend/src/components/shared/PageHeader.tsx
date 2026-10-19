import React from "react";
import { Badge } from "@/components/ui/badge";
import { BADGE_BASE, TONES, type Tone } from "@/lib/tones";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  badgeTone?: Tone;
  eyebrow?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  badge,
  badgeTone = "neutral",
  eyebrow,
  children,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex shrink-0 flex-wrap items-start justify-between gap-5",
        className,
      )}
    >
      <div className="flex flex-col gap-2">
        {eyebrow && <div>{eyebrow}</div>}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          {badge && (
            <Badge className={cn(BADGE_BASE, "h-auto", TONES[badgeTone].badge)}>
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-base text-muted-foreground">{description}</p>
        )}
      </div>

      {children && (
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
      )}
    </header>
  );
}
