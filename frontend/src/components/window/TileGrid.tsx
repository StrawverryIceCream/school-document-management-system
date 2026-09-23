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

type TileGridProps = {
  onSelect: (id: WindowViewId) => void;
  activeId: WindowViewId | null;
};

function TileGrid({ onSelect, activeId }: TileGridProps) {
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Windows</h1>
        <p className="text-sm text-muted-foreground">Choose a college or department</p>
      </div>
      <div className="grid grid-cols-3 gap-10">
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
              <p
                className="absolute bottom-2 left-3 right-3 text-2xl font-semibold text-white"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
              >
                {tile.description}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default TileGrid;