import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Settings, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSystemSettings } from "@/provider/SystemSettingsProvider";

interface AcademicTermSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AcademicTermSettingsDialog({
  open,
  onOpenChange,
}: AcademicTermSettingsDialogProps) {
  const {
    activeAcademicTerm,
    systemVersion,
    systemVersionLabel,
    updateSettings,
  } = useSystemSettings();

  const [termInput, setTermInput] = useState(activeAcademicTerm);
  const [versionInput, setVersionInput] = useState(systemVersion);
  const [versionLabelInput, setVersionLabelInput] = useState(systemVersionLabel);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setTermInput(activeAcademicTerm);
    setVersionInput(systemVersion);
    setVersionLabelInput(systemVersionLabel);
  }, [activeAcademicTerm, systemVersion, systemVersionLabel, open]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedTerm = termInput.trim();
    const trimmedVersion = versionInput.trim();
    const trimmedVersionLabel = versionLabelInput.trim();

    if (!trimmedTerm) {
      setErrorMsg("Active academic term cannot be empty.");
      return;
    }
    if (trimmedTerm.length > 50) {
      setErrorMsg("Academic term must be 50 characters or fewer.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await updateSettings({
        activeAcademicTerm: trimmedTerm,
        systemVersion: trimmedVersion || undefined,
        systemVersionLabel: trimmedVersionLabel || undefined,
      });
      toast.success("System settings updated successfully");
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update system settings";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="gap-1.5">
            <div className="flex items-center gap-2">
              <Settings className="size-5 text-primary" />
              <DialogTitle className="text-lg font-bold">
                Configure System &amp; Term Settings
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              Manage institution-wide configuration anchors including active academic term,
              build version, and branding badges.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="academic-term-input">Active Academic Term</Label>
              <Input
                id="academic-term-input"
                placeholder="e.g. AY 2026–2027"
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Advancing the term prompts enrolled students to submit their Certificate of
                Registration (COR) for verification prior to new document requests.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="system-version-input">System Version</Label>
              <Input
                id="system-version-input"
                placeholder="e.g. v1.0.0"
                value={versionInput}
                onChange={(e) => setVersionInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Displayed in landing footer build badge and system metadata.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="system-version-label-input">System Version Badge Label</Label>
              <Input
                id="system-version-label-input"
                placeholder="e.g. v1.0 System"
                value={versionLabelInput}
                onChange={(e) => setVersionLabelInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Displayed beside the ARCH logo across headers and navigation.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save Settings"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
