import { useWindowView } from "@/hooks/useWindowView";
import WindowTileGrid from "@/components/window/WindowTileGrid";
import WindowRequestTableView from "@/components/window/WindowRequestTableView";

export type WindowViewId = "cos" | "coe" | "cafa" | "cmms" | "cit" | "cie";

export interface WindowTile {
  id: WindowViewId;
  title: string;
  imageSrc: string;
  description: string;
}

export const TILES: WindowTile[] = [
  { id: "cos", title: "COS", imageSrc: "/images/window/COS.png", description: "College of Science" },
  { id: "coe", title: "COE", imageSrc: "/images/window/COE.png", description: "College of Engineering" },
  { id: "cafa", title: "CAFA", imageSrc: "/images/window/CAFA.png", description: "College of Architecture and Fine Arts" },
  { id: "cmms", title: "CMMS", imageSrc: "/images/window/CMMS.png", description: "College of Management & Multidisciplinary Studies" },
  { id: "cit", title: "CIT", imageSrc: "/images/window/CIT.png", description: "College of Information Technology" },
  { id: "cie", title: "CIE", imageSrc: "/images/window/CIE.png", description: "College of Industrial Education" },
];

function Windows() {
  const { activeView } = useWindowView();
  if (activeView) {
    return <WindowRequestTableView />;
  }

  return <WindowTileGrid />;
}

export default Windows;
