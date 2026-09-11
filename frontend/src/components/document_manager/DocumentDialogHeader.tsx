import { DialogHeader, DialogDescription, DialogTitle } from "../ui/dialog";

function DocumentDialogHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Add Document</DialogTitle>
      <DialogDescription>
        Set up a document students and teachers can request. Add any info
        they&apos;ll need to provide when requesting it.
      </DialogDescription>
    </DialogHeader>
  );
}

export default DocumentDialogHeader;
