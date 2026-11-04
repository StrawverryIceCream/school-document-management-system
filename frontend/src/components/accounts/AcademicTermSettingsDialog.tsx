import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Calendar, AlertCircle } from "lucide-react";
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
  const { activeAcademicTerm, updateTerm } = useSystemSettings();
  const [termInput, setTermInput] = useState(activeAcademicTerm);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = termInput.trim();
    if (!trimmed) {
      setErrorMsg("Active academic term cannot be empty.");
      return;
    }
    if (trimmed.length > 50) {
      setErrorMsg("Academic term must be 50 characters or fewer.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await updateTerm(trimmed);
      toast.success(`Active academic term updated to ${trimmed}`);
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update academic term";
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
              <Calendar className="size-5 text-primary" />
              <DialogTitle className="text-lg font-bold">
                Configure Active Academic Term
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm">
              The active academic term anchors public notices, registration stamping,
              and student document request verification gates across the institution.
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
              <Label htmlFor="academic-term-input">Academic Term</Label>
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
              {submitting ? "Saving..." : "Save Active Term"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
