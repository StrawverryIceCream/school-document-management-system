import { Card } from "@/components/ui/card";
import { useWindowView } from "@/hooks/useWindowView";

import { cn } from "cn";

function WindowTileGrid() {
  const { TILES, selectView, activeView } = useWindowView();
  return (
    <div className="h-full overflow-hidden p-6 sm:p-10">
      <div className="mb-8 flex items-start justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Windows</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a college or department
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        {TILES.map((tile) => (
          <Card
            key={tile.id}
            role="button"
            tabIndex={0}
            onClick={() => selectView(tile.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") selectView(tile.id);
            }}
            style={{ "--card-spacing": "0px" } as React.CSSProperties}
            className={cn(
              "cursor-pointer",
              activeView === tile.id && "ring-2 ring-primary",
            )}
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

export default WindowTileGrid;
