import { Button } from "@/components/ui/button";
import { SquareArrowRightExit } from "lucide-react";

export type { StatusFilter } from "@/context/RequestContext";

function RequestHeader() {
  return (
    <div className="mb-8 space-y-5">
      <div className="flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">All Request</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            All Request in the database
          </p>
        </div>
        <Button
          className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors"
          variant="default"
        >
          <SquareArrowRightExit />
          Export Report
        </Button>
      </div>
    </div>
  );
}

export default RequestHeader;
