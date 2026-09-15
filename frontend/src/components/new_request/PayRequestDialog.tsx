import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";

function PayRequestDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button type="submit" className="mt-6">
          Next Step
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Step 1</DialogTitle>
          <DialogDescription>Choose Document</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default PayRequestDialog;
