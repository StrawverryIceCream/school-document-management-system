import { WindowRequestDialogs } from "./WindowRequestDialogs";
import { WindowRequestFilters } from "./WindowRequestFilters";
import { WindowRequestGuidelines } from "./WindowRequestGuidelines";
import { WindowRequestHeader } from "./WindowRequestHeader";
import { WindowRequestSummary } from "./WindowRequestSummary";
import { WindowRequestTable } from "./WindowRequestTable";

export default function WindowRequestTableView() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <WindowRequestHeader />
      <WindowRequestSummary />
      <WindowRequestFilters />
      <div className="flex min-h-0 flex-1 flex-col">
        <WindowRequestTable />
      </div>
      <WindowRequestGuidelines />
      <WindowRequestDialogs />
    </div>
  );
}
