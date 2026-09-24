import { useWindowView } from "@/hooks/useWindowView";
import TileGrid from "@/components/window/WindowTileGrid";
import RequestTable from "@/components/window/WindowRequestTable";

export interface WindowTile {
  id: string;
  title: string;
  imageSrc: string;
  description: string;
}

const TILES: WindowTile[] = [
  {
    id: "cos",
    title: "COS",
    imageSrc: "/images/window/COS.png",
    description: "College of Science",
  },
  {
    id: "coe",
    title: "COE",
    imageSrc: "/images/window/COE.png",
    description: "College of Engineering",
  },
  {
    id: "cafa",
    title: "CAFA",
    imageSrc: "/images/window/CAFA.png",
    description: "College of Architecture and Fine Arts",
  },
  {
    id: "cmms",
    title: "CMMS",
    imageSrc: "/images/window/CMMS.png",
    description: "College of Management & Multidisciplinary Studies",
  },
  {
    id: "cit",
    title: "CIT",
    imageSrc: "/images/window/CIT.png",
    description: "College of Information Technology",
  },
  {
    id: "cie",
    title: "CIE",
    imageSrc: "/images/window/CIE.png",
    description: "College of Industrial Education",
  },
];

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

  return <TileGrid onSelect={selectView} activeId={activeView} TILES={TILES} />;
}

export default Windows;
