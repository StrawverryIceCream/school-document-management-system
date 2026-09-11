import { DialogClose, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";


function DocumentDialogFooter({handleSubmit} : {handleSubmit: () => Promise<void>}) {
  return (
    <DialogFooter className="mt-4">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button type="submit" onClick={handleSubmit}>Save document</Button>
    </DialogFooter>
  );
}

export default DocumentDialogFooter;
