import { Card } from "@/components/ui/card";
import { cn } from "cn";
import type { WindowTile, WindowViewId } from "@/types/window";

export const TILES: WindowTile[] = [
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
    description: "College of Maritime, Marine, and other relevant field",
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

type TileGridProps = {
  onSelect: (id: WindowViewId) => void;
  activeId: WindowViewId | null;
};

function TileGrid({ onSelect, activeId }: TileGridProps) {
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {TILES.map((tile) => (
          <Card
            key={tile.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(tile.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(tile.id);
            }}
            style={{ "--card-spacing": "0px" } as React.CSSProperties}
            className={cn("cursor-pointer", activeId === tile.id && "ring-2 ring-primary")}
          >
            <div className="relative w-full aspect-video">
              <img
                src={tile.imageSrc}
                alt={tile.title}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute bottom-1 left-3 right-3 rounded-lg bg-black/60 px-3 py-1 backdrop-blur-sm">
                <p className="text-sm font-medium text-white">{tile.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TileGrid;