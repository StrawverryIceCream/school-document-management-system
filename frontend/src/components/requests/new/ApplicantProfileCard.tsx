// frontend/src/components/requests/new/ApplicantProfileCard.tsx
import { ShieldCheck, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { getRequesterProfileSummary } from "@/lib/profile";
import { cn } from "@/lib/utils";

export default function ApplicantProfileCard() {
  const { user } = useAuth();
  if (!user) return null;

  const summary = getRequesterProfileSummary(user);

  return (
    <Card className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
        <div className="flex items-center gap-2.5">
          <span className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <UserCheck className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">
              Requester Profile
            </h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
              {summary.subtitle}
            </span>
          </div>
        </div>
        <Badge variant={summary.badgeVariant} className="shrink-0">
          {summary.badgeLabel}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {summary.tiles.map((tile) => (
          <div
            key={tile.label}
            className="bg-muted/40 p-3.5 rounded-xl border flex flex-col"
          >
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {tile.label}
            </span>
            <span
              className={cn(
                "mt-0.5 text-sm font-semibold text-foreground sm:text-base",
                tile.accent && "font-bold text-primary tracking-wide",
              )}
            >
              {tile.value}
            </span>
            <span className="text-xs text-muted-foreground mt-1 truncate">
              {tile.detail}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
