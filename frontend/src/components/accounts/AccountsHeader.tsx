import { Download } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/useUsers";
import {
  ACCOUNTS_DESCRIPTION,
  ACCOUNTS_TITLE,
  EXPORT_ERROR_MESSAGE,
  EXPORT_LABEL,
  EXPORTING_LABEL,
  REGISTRY_BADGE_LABEL,
} from "@/lib/accounts/accounts-header";
import { BADGE_BASE, TONES } from "@/lib/tones";
import { cn } from "cn";

export default function AccountsHeader() {
  const { exportAccounts } = useUsers();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  return (
    <header className="flex shrink-0 flex-wrap items-start justify-between gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {ACCOUNTS_TITLE}
          </h1>
          <Badge className={cn(BADGE_BASE, "h-auto", TONES.neutral.badge)}>
            {REGISTRY_BADGE_LABEL}
          </Badge>
        </div>
        <p className="text-base text-muted-foreground">{ACCOUNTS_DESCRIPTION}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="h-11 px-5 text-base"
            disabled={isExporting}
            onClick={async () => {
              setIsExporting(true);
              setExportError(null);
              try {
                await exportAccounts();
              } catch (err) {
                console.error("Failed to export accounts:", err);
                setExportError(EXPORT_ERROR_MESSAGE);
              } finally {
                setIsExporting(false);
              }
            }}
          >
            <Download className="size-5" aria-hidden="true" />
            {isExporting ? EXPORTING_LABEL : EXPORT_LABEL}
          </Button>
        </div>
        {exportError && (
          <p role="alert" className="text-sm text-destructive">
            {exportError}
          </p>
        )}
      </div>
    </header>
  );
}
