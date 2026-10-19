import { useWindowView } from "@/hooks/useWindowView";
import WindowRequestTableView from "@/components/window/WindowRequestTableView";
import WindowsHeader from "@/components/window/WindowsHeader";
import  CollegeWindowCards  from "@/components/window/CollegeWindowCards";

export interface WindowTile {
  id: string;
  title: string;
  imageSrc: string;
  description: string;
}

export default function Windows() {
  const { activeView } = useWindowView();

  if (activeView) {
    return <WindowRequestTableView />;
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <WindowsHeader />
      <CollegeWindowCards />
    </div>
  );
}