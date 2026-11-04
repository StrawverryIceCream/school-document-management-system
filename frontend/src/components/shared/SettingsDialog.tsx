import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  Settings,
  AlertCircle,
  Moon,
  Sun,
  Laptop,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useSystemSettings } from "@/provider/SystemSettingsProvider";
import { useTheme } from "next-themes";
import { getInitials, ROLE_META } from "@/lib/profile";
import ProfileFields from "@/components/profile/ProfileFields";

export default function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const role = user ? ROLE_META[user.role] : undefined;
  const { theme, setTheme } = useTheme();

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

  // Sync inputs when settings change or dialog opens
  useEffect(() => {
    setTermInput(activeAcademicTerm);
    setVersionInput(systemVersion);
    setVersionLabelInput(systemVersionLabel);
    setErrorMsg(null);
  }, [activeAcademicTerm, systemVersion, systemVersionLabel, open]);

  // Listen to open-settings custom event
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-settings", handleOpen);
    return () => window.removeEventListener("open-settings", handleOpen);
  }, []);

  async function handleSaveSettings(e: FormEvent) {
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
      setOpen(false);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update system settings";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            <DialogTitle className="text-xl font-bold">
              {isAdmin ? "System & Account Settings" : "Account & App Settings"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {isAdmin
              ? "Configure institutional term and build settings or review your personal account."
              : "Review your account profile details and adjust interface preferences."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue={isAdmin ? "system" : "profile"}
          className="w-full"
        >
          <div className="px-6 border-b">
            <TabsList className="bg-transparent h-10 p-0 gap-6">
              {isAdmin && (
                <TabsTrigger
                  value="system"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 pb-2 font-medium text-xs sm:text-sm"
                >
                  System &amp; Term
                </TabsTrigger>
              )}
              <TabsTrigger
                value="profile"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 pb-2 font-medium text-xs sm:text-sm"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 pb-2 font-medium text-xs sm:text-sm"
              >
                Appearance
              </TabsTrigger>
            </TabsList>
          </div>

          {isAdmin && (
            <TabsContent value="system" className="p-6 pt-4 focus-visible:outline-none">
              <form onSubmit={handleSaveSettings} className="space-y-4">
                {errorMsg && (
                  <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="settings-academic-term">Active Academic Term</Label>
                  <Input
                    id="settings-academic-term"
                    placeholder="e.g. AY 2026–2027"
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Advancing the term prompts enrolled students to submit a fresh COR
                    before filing requests.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="settings-system-version">System Version</Label>
                  <Input
                    id="settings-system-version"
                    placeholder="e.g. v1.0.0"
                    value={versionInput}
                    onChange={(e) => setVersionInput(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Displayed in landing footer build badges and system metadata.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="settings-system-version-label">
                    System Version Badge Label
                  </Label>
                  <Input
                    id="settings-system-version-label"
                    placeholder="e.g. v1.0 System"
                    value={versionLabelInput}
                    onChange={(e) => setVersionLabelInput(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Displayed alongside the ARCH logo across headers and navigation.
                  </p>
                </div>

                <DialogFooter className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Settings"}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          )}

          <TabsContent value="profile" className="p-6 pt-4 max-h-[60vh] overflow-y-auto focus-visible:outline-none">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-14 items-center justify-center">
                  <AvatarFallback className="text-xl font-normal">
                    {getInitials(user?.fullName || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid min-w-0 flex-1 gap-1 text-left leading-tight">
                  <span className="truncate text-lg font-medium leading-tight">
                    {user?.fullName}
                  </span>
                  {role && (
                    <Badge variant={role.variant} className="w-fit text-xs">
                      {role.label}
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />
              {user && <ProfileFields user={user} />}
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="p-6 pt-4 focus-visible:outline-none">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Interface Theme</h4>
                <p className="text-xs text-muted-foreground">
                  Select how the application is displayed on your device.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors cursor-pointer ${
                    theme === "light"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Sun className="size-5" />
                  <span>Light</span>
                  {theme === "light" && <Check className="size-3 text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors cursor-pointer ${
                    theme === "dark"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Moon className="size-5" />
                  <span>Dark</span>
                  {theme === "dark" && <Check className="size-3 text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-center gap-2 rounded-xl border p-4 text-xs font-medium transition-colors cursor-pointer ${
                    theme === "system"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <Laptop className="size-5" />
                  <span>System</span>
                  {theme === "system" && <Check className="size-3 text-primary" />}
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
