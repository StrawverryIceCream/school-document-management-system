import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function MyRequestDetails() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Review the selected request information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-sm">
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Request ID</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Document</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Date Requested</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Payment Status</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Request Status</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Purpose</span>
            <span className="font-medium">--</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">Release Date</span>
            <span className="font-medium">--</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default MyRequestDetails;
