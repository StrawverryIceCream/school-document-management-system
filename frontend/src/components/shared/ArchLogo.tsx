import { Notebook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  SYSTEM_NAME,
  SYSTEM_VERSION_LABEL,
  SYSTEM_TAGLINE,
} from "@/lib/constants";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "@/lib/utils";

export interface ArchLogoProps {
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  showTagline?: boolean;
  href?: string | null;
  className?: string;
  iconClassName?: string;
}

export function ArchLogo({
  size = "md",
  showBadge = true,
  showTagline = true,
  href = "/",
  className,
  iconClassName,
}: ArchLogoProps) {
  const sizeStyles = {
    sm: {
      container: "gap-2",
      iconBox: "size-8 rounded-lg",
      icon: "size-4",
      title: "text-lg font-bold tracking-tight",
      badge: "text-[10px] px-1.5 py-0",
      tagline: "text-[11px]",
    },
    md: {
      container: "gap-3",
      iconBox: "size-12 rounded-xl shadow-xs",
      icon: "size-7",
      title: "text-2xl font-extrabold tracking-tight",
      badge: "text-xs px-2 py-0.5",
      tagline: "text-sm",
    },
    lg: {
      container: "gap-4",
      iconBox: "size-14 rounded-2xl shadow-md",
      icon: "size-8",
      title: "text-3xl font-extrabold tracking-tight",
      badge: "text-sm px-2.5 py-1",
      tagline: "text-base",
    },
  }[size];

  const content = (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-sidebar-primary text-sidebar-primary-foreground transition-transform group-hover:scale-105",
          sizeStyles.iconBox,
          iconClassName,
        )}
      >
        <Notebook className={sizeStyles.icon} aria-hidden="true" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "leading-none text-foreground transition-colors group-hover:text-primary",
              sizeStyles.title,
            )}
          >
            {SYSTEM_NAME}
          </span>
          {showBadge && (
            <Badge
              className={cn(
                BADGE_BASE,
                "border-transparent font-medium",
                TONES.brand.badge,
                sizeStyles.badge,
              )}
            >
              {SYSTEM_VERSION_LABEL}
            </Badge>
          )}
        </div>
        {showTagline && (
          <p
            className={cn(
              "mt-0.5 hidden font-medium uppercase tracking-wider text-muted-foreground sm:block",
              sizeStyles.tagline,
            )}
          >
            {SYSTEM_TAGLINE}
          </p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className={cn(
          "group flex items-center transition-opacity hover:opacity-95 focus-visible:outline-hidden",
          sizeStyles.container,
          className,
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center",
        sizeStyles.container,
        className,
      )}
    >
      {content}
    </div>
  );
}

export default ArchLogo;
