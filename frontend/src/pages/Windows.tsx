import { useWindowView } from "@/hooks/useWindowView";
import TileGrid, { TILES } from "@/components/window/TileGrid";
import RequestTable from "@/components/window/views/RequestTable";

function Windows() {
  const { activeView, selectView, clearView } = useWindowView();

  if (activeView) {
    const college = TILES.find((tile) => tile.id === activeView);
    return (
      <RequestTable
        collegeId={activeView}
        collegeTitle={college?.title ?? activeView}
        onBack={clearView}
      />
    );
  }

  return <TileGrid onSelect={selectView} activeId={activeView} />;
}

export default Windows;