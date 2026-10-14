import { WindowRequestDialogs } from "@/components/window/WindowRequestDialogs";
import { WindowRequestFilters } from "@/components/window/WindowRequestFilters";
import { WindowRequestGuidelines } from "@/components/window/WindowRequestGuidelines";
import { WindowRequestHeader } from "@/components/window/WindowRequestHeader";
import { WindowRequestSummary } from "@/components/window/WindowRequestSummary";
import { WindowRequestTable } from "@/components/window/WindowRequestTable";

function WindowRequestTableView() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <WindowRequestHeader />
        <WindowRequestSummary />
        <WindowRequestFilters />
        <WindowRequestTable />
        <WindowRequestGuidelines />
      </div>
      <WindowRequestDialogs />
    </div>
  );
}

export default WindowRequestTableView;
