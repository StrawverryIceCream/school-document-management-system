import { useState, type FormEvent, type ChangeEvent } from "react";
import { toast } from "sonner";
import { UploadCloud, AlertCircle } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitAccountUpdate } from "@/api/accountUpdates";
import { useAuth } from "@/hooks/useAuth";
import type { StudentStatus } from "@/types";

interface AcademicTermUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeAcademicTerm: string;
  onSuccess: () => void;
}

export default function AcademicTermUpdateDialog({
  open,
  onOpenChange,
  activeAcademicTerm,
  onSuccess,
}: AcademicTermUpdateDialogProps) {
  const { user } = useAuth();

  const [studentStatus, setStudentStatus] = useState<StudentStatus>(
    (user?.studentStatus as StudentStatus) || "regular",
  );
  const [yearLevel, setYearLevel] = useState<string>(
    user?.yearLevel ? String(user.yearLevel) : "1",
  );
  const [section, setSection] = useState<string>(user?.section || "");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isAlumni = studentStatus === "alumni";

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed.");
      return;
    }

    setProofFile(file);
    setErrorMsg(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!proofFile) {
      setErrorMsg("Please upload your verification proof image.");
      return;
    }

    if (!isAlumni && (!yearLevel || parseInt(yearLevel, 10) < 1 || parseInt(yearLevel, 10) > 6)) {
      setErrorMsg("Please select a valid year level (1–6).");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("requestedStudentStatus", studentStatus);
      if (!isAlumni) {
        formData.append("requestedYearLevel", yearLevel);
        if (section.trim()) {
          formData.append("requestedSection", section.trim());
        }
      }
      formData.append("proofFile", proofFile);

      await submitAccountUpdate(formData);
      toast.success("Verification request submitted successfully.");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit verification.";
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
            <DialogTitle className="text-lg font-bold">
              Verify Academic Term Standing
            </DialogTitle>
            <DialogDescription className="text-sm">
              Confirm your enrollment standing for{" "}
              <strong className="text-foreground">{activeAcademicTerm}</strong>.
              Your update will be reviewed by the Registrar.
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
              <Label htmlFor="student-status">Student Status</Label>
              <Select
                value={studentStatus}
                onValueChange={(val) => setStudentStatus(val as StudentStatus)}
              >
                <SelectTrigger id="student-status">
                  <SelectValue placeholder="Select student status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="irregular">Irregular</SelectItem>
                  <SelectItem value="graduating">Graduating</SelectItem>
                  <SelectItem value="alumni">Alumni / Graduated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!isAlumni && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="year-level">Year Level</Label>
                  <Select value={yearLevel} onValueChange={setYearLevel}>
                    <SelectTrigger id="year-level">
                      <SelectValue placeholder="Select year level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                      <SelectItem value="5">5th Year</SelectItem>
                      <SelectItem value="6">6th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    placeholder="e.g. BSCS-3A"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="proof-file">
                {isAlumni
                  ? "Graduation Proof (Diploma / Transcript / Alumni ID)"
                  : "Certificate of Registration (COR) Proof"}
              </Label>
              <div className="mt-1 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 text-center hover:bg-muted/30 transition-colors">
                <UploadCloud className="size-8 text-muted-foreground mb-2" />
                <label
                  htmlFor="proof-file"
                  className="cursor-pointer text-xs font-medium text-primary hover:underline"
                >
                  {proofFile ? proofFile.name : "Click to upload proof image"}
                </label>
                <span className="text-[11px] text-muted-foreground mt-1">
                  JPG, PNG, or WebP up to 5MB
                </span>
                <input
                  id="proof-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
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
              {submitting ? "Submitting..." : "Submit Verification"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
