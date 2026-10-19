import { WindowRequestDialogs } from "@/components/window/WindowRequestDialogs";
import { WindowRequestFilters } from "@/components/window/WindowRequestFilters";
import { WindowRequestGuidelines } from "@/components/window/WindowRequestGuidelines";
import { WindowRequestHeader } from "@/components/window/WindowRequestHeader";
import { WindowRequestSummary } from "@/components/window/WindowRequestSummary";
import { WindowRequestTable } from "@/components/window/WindowRequestTable";

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
