import { GraduationCap } from "lucide-react";
import { useSystemSettings } from "@/provider/SystemSettingsProvider";
import { SYSTEM_VERSION } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";
import {
  FOOTER_BRAND,
  FOOTER_COLUMNS,
  FOOTER_COPYRIGHT,
  LEGAL_LINKS,
} from "@/lib/landing/landing-footer";
import { TONES } from "@/lib/tones";

// The `dark` class re-themes this footer with the .dark tokens from index.css,
// so it stays dark in both light and dark mode without hardcoded colors.
export default function LandingFooter() {
  const { systemVersion } = useSystemSettings();
  return (
    <footer className="dark border-t border-border bg-background py-14 text-foreground">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4 sm:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="size-6" aria-hidden="true" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-foreground">
                  {FOOTER_BRAND.name}
                </span>
                <p className="text-sm text-muted-foreground">
                  {FOOTER_BRAND.tagline}
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {FOOTER_BRAND.description}
            </p>
            <p className="text-sm text-muted-foreground/80">
              {`Current Build: ${systemVersion || SYSTEM_VERSION} • Production Grade`}
            </p>
          </div>

          {FOOTER_COLUMNS.map(({ id, heading, items }) => (
            <div key={id} className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                {heading}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {items.map(({ label, href, tone }) => (
                  <li key={label}>
                    {href ? (
                      <a
                        href={href}
                        className="transition-colors hover:text-foreground"
                      >
                        {label}
                      </a>
                    ) : (
                      <span className={tone && TONES[tone].value}>{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="space-y-8">
          <Separator />
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <p>{FOOTER_COPYRIGHT}</p>
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="transition-colors hover:text-foreground"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
