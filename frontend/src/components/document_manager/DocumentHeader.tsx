import { ClipboardPlus } from "lucide-react";
import { Button } from "../ui/button";

function DocumentHeader() {
  return (
    <div className="flex items-start justify-between mb-8 gap-5">
      <div>
        <h1 className="text-3xl font-bold tracking-normal">Document Manager</h1>
        <p className="text-sm mt-2">All document tracking shits </p>
      </div>
      <Button className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium  transition-colors" variant="default">
        <ClipboardPlus className="w-4 h-4" />
        Add account
      </Button>
    </div>
  );
}

export default DocumentHeader;
