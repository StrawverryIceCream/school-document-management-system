import { useWindowView } from "@/hooks/useWindowView";
import { WindowViewProvider } from "@/provider/WindowViewProvider";
import WindowTileGrid from "@/components/window/WindowTileGrid";
import WindowPlaceholderView from "@/components/window/WindowPlaceholderView";
import WindowRequestTableView from "@/components/window/WindowRequestTableView";

function WindowExplorer() {
  return (
    <WindowViewProvider>
      <WindowExplorerContent />
    </WindowViewProvider>
  );
}

function WindowExplorerContent() {
  const { activeView, TILES } = useWindowView();

  if (!activeView) {
    return <WindowTileGrid />;
  }

  const tile = TILES.find((t) => t.id === activeView);

  if (!tile) {
    return <WindowPlaceholderView title="Unknown view" />;
  }

  return <WindowRequestTableView />;
}

export default WindowExplorer;
