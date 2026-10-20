import { useWindowView } from "@/hooks/useWindowView";
import WindowRequestTableView from "@/components/windows/WindowRequestTableView";
import WindowsHeader from "@/components/windows/WindowsHeader";
import CollegeWindowCards from "@/components/windows/CollegeWindowCards";

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