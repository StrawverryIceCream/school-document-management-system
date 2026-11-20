import { Calendar, Download, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useUsers } from "@/hooks/useUsers";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from "@/provider/SystemSettingsProvider";
import AcademicTermSettingsDialog from "./AcademicTermSettingsDialog";
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
  const { user } = useAuth();
  const {
    activeAcademicTerm,
    loginTwoFactorEnabled,
    loading: settingsLoading,
    updateTwoFactor,
  } = useSystemSettings();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [termDialogOpen, setTermDialogOpen] = useState(false);
  const [togglingTwoFactor, setTogglingTwoFactor] = useState(false);

  const isAdmin = user?.role === "admin";

  async function handleToggleTwoFactor(checked: boolean) {
    setTogglingTwoFactor(true);
    try {
      await updateTwoFactor(checked);
      toast.success(
        checked
          ? "Login two-factor authentication enabled."
          : "Login two-factor authentication disabled.",
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to update two-factor authentication setting",
      );
    } finally {
      setTogglingTwoFactor(false);
    }
  }

  return (
    <>
      <PageHeader
        title={ACCOUNTS_TITLE}
        badge={REGISTRY_BADGE_LABEL}
        description={ACCOUNTS_DESCRIPTION}
      >
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <div className="flex h-11 items-center gap-2.5 rounded-md border bg-background px-3.5">
              <ShieldCheck className="size-4 text-primary shrink-0" />
              <Label
                htmlFor="login-2fa-toggle"
                className="cursor-pointer text-sm font-medium whitespace-nowrap"
              >
                Login 2FA
              </Label>
              <Badge
                variant={loginTwoFactorEnabled ? "default" : "secondary"}
                className="text-[11px] font-semibold"
              >
                {loginTwoFactorEnabled ? "ON" : "OFF"}
              </Badge>
              <Switch
                id="login-2fa-toggle"
                aria-label="Toggle login two-factor authentication"
                checked={loginTwoFactorEnabled}
                disabled={togglingTwoFactor || settingsLoading}
                onCheckedChange={handleToggleTwoFactor}
              />
            </div>
          )}

          {isAdmin && (
            <Button
              variant="outline"
              className="h-11 px-4 text-sm gap-2"
              onClick={() => setTermDialogOpen(true)}
            >
              <Calendar className="size-4 text-primary" />
              <span>
                Active Term: <strong>{activeAcademicTerm}</strong>
              </span>
            </Button>
          )}

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
      </PageHeader>

      {isAdmin && (
        <AcademicTermSettingsDialog
          open={termDialogOpen}
          onOpenChange={setTermDialogOpen}
        />
      )}
    </>
  );
}
