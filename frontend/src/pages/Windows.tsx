import { useWindowView } from "@/hooks/useWindowView";
import WindowTileGrid from "@/components/window/WindowTileGrid";
import WindowRequestTableView from "@/components/window/WindowRequestTableView";

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

  return <WindowTileGrid />;
}

export default Windows;
