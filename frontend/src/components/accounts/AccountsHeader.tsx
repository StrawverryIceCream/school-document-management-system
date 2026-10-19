import { Download } from "lucide-react";
import { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
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

export default function AccountsHeader() {
  const { exportAccounts } = useUsers();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  return (
    <PageHeader
      title={ACCOUNTS_TITLE}
      badge={REGISTRY_BADGE_LABEL}
      description={ACCOUNTS_DESCRIPTION}
    >
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
      {exportError && (
        <p role="alert" className="text-sm text-destructive">
          {exportError}
        </p>
      )}
    </PageHeader>
  );
}
