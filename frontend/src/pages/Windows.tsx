import { useWindowView } from "@/hooks/useWindowView";
import WindowTileGrid from "@/components/window/WindowTileGrid";
import WindowRequestTable from "@/components/window/views/WindowRequestTable";

function Windows() {
  const { activeView } = useWindowView();

  if (activeView) {
    return <WindowRequestTable collegeId={activeView} />;
  }

  return <WindowTileGrid />;
}

export default Windows;