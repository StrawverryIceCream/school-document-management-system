import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DocumentList from "./DocumentList";

function CreateRequest() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button
          className="w-full h-32 sm:h-40 flex-col gap-2 text-lg"
          variant="outline"
        >
          <Plus className="size-6" />
          <span>New request</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Step 1</DialogTitle>
          <DialogDescription>Choose Document
          </DialogDescription>
        </DialogHeader>
        <DocumentList />

      </DialogContent>
    </Dialog>
  );
}

export default CreateRequest;
