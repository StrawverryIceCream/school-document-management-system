import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function DocumentDialogFooter({
  handleSubmit,
}: {
  handleSubmit: () => Promise<void>;
}) {
  return (
    <DialogFooter className="mt-4">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <DialogClose>
        <Button type="button" onClick={() => void handleSubmit()}>
          Save document
        </Button>
      </DialogClose>
    </DialogFooter>
  );
}

export default DocumentDialogFooter;
