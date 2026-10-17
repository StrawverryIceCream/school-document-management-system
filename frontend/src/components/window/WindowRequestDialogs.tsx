import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useWindowView } from "@/hooks/useWindowView";

export function WindowRequestDialogs() {
  const { guidelinesOpen, setGuidelinesOpen, TILES, activeView } =
    useWindowView();
  const college = TILES.find((tile) => tile.id === activeView);
  const collegeTitle = college?.title ?? activeView ?? "Department";
  const collegeDescription = college?.description ?? collegeTitle;

  return (
    <Dialog open={guidelinesOpen} onOpenChange={setGuidelinesOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{collegeDescription} Desk Guidelines</DialogTitle>
          <DialogDescription>
            Use these checks before changing a request status.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>
            Verify the requester&apos;s identity and student details against
            the student database.
          </p>
          <p>
            Confirm the document type and required information before marking
            a request ready for release.
          </p>
          <p>
            Keep request statuses current. Unclaimed requests automatically
            re-route after 5 calendar days.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={() => setGuidelinesOpen(false)}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
