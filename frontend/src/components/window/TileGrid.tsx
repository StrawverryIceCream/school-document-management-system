import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {TILES.map((tile) => (
        <Card
          key={tile.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(tile.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect(tile.id);
          }}
          className={cn(
            "cursor-pointer transition-shadow hover:shadow-md",
            activeId === tile.id && "ring-2 ring-primary"
          )}
        >
          <img
            src={tile.imageSrc}
            alt={tile.title}
            className="w-full aspect-video object-cover"
          />
          <CardHeader>
            <CardTitle>{tile.title}</CardTitle>
            <CardDescription>{tile.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export default TileGrid;