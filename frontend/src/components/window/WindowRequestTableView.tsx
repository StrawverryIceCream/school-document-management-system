import { WindowRequestDialogs } from "@/components/window/WindowRequestDialogs";
import { WindowRequestFilters } from "@/components/window/WindowRequestFilters";
import { WindowRequestGuidelines } from "@/components/window/WindowRequestGuidelines";
import { WindowRequestHeader } from "@/components/window/WindowRequestHeader";
import { WindowRequestSummary } from "@/components/window/WindowRequestSummary";
import { WindowRequestTable } from "@/components/window/WindowRequestTable";

function WindowRequestTableView() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6">
      <div className="space-y-4">
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
