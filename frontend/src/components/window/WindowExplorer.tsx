import { useWindowView } from "@/hooks/useWindowView";
import { WindowViewProvider } from "@/provider/WindowViewProvider";
import WindowTileGrid, { TILES } from "@/components/window/WindowTileGrid";
import WindowRequestTable from "@/components/window/views/WindowRequestTable";
import WindowPlaceholderView from "@/components/window/views/WindowPlaceholderView";

function WindowExplorer() {
  return (
    <WindowViewProvider>
      <WindowExplorerContent />
    </WindowViewProvider>
  );
}

function WindowExplorerContent() {
  const { activeView } = useWindowView();

  if (!activeView) {
    return <WindowTileGrid />;
  }

  const tile = TILES.find((t) => t.id === activeView);

  if (!tile) {
    return <WindowPlaceholderView title="Unknown view" />;
  }

  return <WindowRequestTable collegeId={tile.id} />;
}

export default WindowExplorer;