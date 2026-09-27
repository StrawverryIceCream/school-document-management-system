import { useWindowView } from "@/hooks/useWindowView";
import { WindowViewProvider } from "@/provider/WindowViewProvider";
import WindowTileGrid from "@/components/window/WindowTileGrid";
import WindowRequestTableView from "@/components/window/WindowRequestTableView";
import { TILES } from "@/pages/Windows";

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
    return <div className="p-6 text-sm text-muted-foreground">Unknown view</div>;
  }

  return <WindowRequestTableView />;
}

export default WindowExplorer;