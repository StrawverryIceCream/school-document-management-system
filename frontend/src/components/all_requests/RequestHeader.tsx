
import { Button } from "@/components/ui/button";


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
        <Button variant="outline">Export report</Button>
      </div>


    </div>
  );
}



export default RequestHeader;
