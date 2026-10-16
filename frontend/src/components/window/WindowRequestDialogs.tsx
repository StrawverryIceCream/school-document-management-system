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
import { REQUEST_STATUS_OPTIONS, REQUEST_WINDOWS } from "@/lib/windowRequests";

export function WindowRequestDialogs() {
  const {
    departmentRequests,
    requestWindowsById,
    selectedRequestId,
    setSelectedRequestId,
    guidelinesOpen,
    setGuidelinesOpen,
    TILES,
    activeView,
  } = useWindowView();
  const selectedRequest = departmentRequests.find(
    (request) => String(request.id) === selectedRequestId,
  );
  const college = TILES.find((tile) => tile.id === activeView);
  const collegeTitle = college?.title ?? activeView ?? "Department";
  const collegeDescription = college?.description ?? collegeTitle;

  return (
    <>
      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) setSelectedRequestId(null);
        }}
      >
        {selectedRequest && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Request</DialogTitle>
              <DialogDescription>
                Check the requester and document details before updating this
                request.
              </DialogDescription>
            </DialogHeader>
            <div className="divide-y rounded-lg border px-4">
              {[
                ["Requester", selectedRequest.user?.fullName ?? "Unknown"],
                ["Student ID", selectedRequest.user?.studentId ?? "—"],
                ["Role", selectedRequest.user?.role ?? "—"],
                [
                  "Document",
                  selectedRequest.documentType?.name ?? "Unknown document",
                ],
                [
                  "Submitted",
                  new Date(selectedRequest.createdAt).toLocaleDateString(
                    "en-US",
                  ),
                ],
                ["Purpose", selectedRequest.purpose ?? "—"],
                [
                  "Current status",
                  REQUEST_STATUS_OPTIONS.find(
                    (status) => status.id === selectedRequest.status,
                  )?.label ?? selectedRequest.status,
                ],
                [
                  "Routing",
                  REQUEST_WINDOWS.find(
                    (window) =>
                      window.id ===
                      requestWindowsById[String(selectedRequest.id)],
                  )?.label ?? "Unassigned",
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                >
                  <span className="text-muted-foreground">{label}</span>
                  <span className="max-w-[65%] text-right font-medium">
                    {value}
                  </span>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedRequestId(null)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

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
    </>
  );
}
