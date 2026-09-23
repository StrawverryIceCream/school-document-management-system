import { DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function RequestDetailsHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Request details</DialogTitle>
      <DialogDescription>
        Review the selected request information from the live request data source.
      </DialogDescription>
    </DialogHeader>
  );
}

export default RequestDetailsHeader;