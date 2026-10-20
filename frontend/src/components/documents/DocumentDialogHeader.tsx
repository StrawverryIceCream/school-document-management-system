import { DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";

function DocumentDialogHeader({ type }: { type: "Add" | "Edit" }) {
  return (
    <DialogHeader>
      <DialogTitle>{type} Document</DialogTitle>
      <DialogDescription>
        Set up a document students and teachers can request. {type} any info
        they&apos;ll need to provide when requesting it.
      </DialogDescription>
    </DialogHeader>
  );
}

export default DocumentDialogHeader;
