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

function Windows() {
  const { activeView } = useWindowView();

  if (activeView) {
    return <WindowRequestTableView />;
  }

  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="mx-auto flex flex-col gap-8">
        <WindowsHeader />
        <CollegeWindowCards />
      </div>
    </div>
  );
}

export default Windows;