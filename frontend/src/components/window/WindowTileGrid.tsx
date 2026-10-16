import { Card } from "@/components/ui/card";
import { useWindowView } from "@/hooks/useWindowView";

import { cn } from "cn";

function WindowTileGrid() {
  const { TILES, selectView, activeView } = useWindowView();
  return (
    <div className="h-full overflow-auto p-6 sm:p-10">
      <div className="h-full space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-normal">Windows</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a college or department
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TILES.map((tile) => (
            <Card
              key={tile.id}
              role="button"
              tabIndex={0}
              onClick={() => selectView(tile.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  selectView(tile.id);
                }
              }}
              style={{ "--card-spacing": "0px" } as React.CSSProperties}
              className={cn(
                "cursor-pointer border border-border shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                activeView === tile.id && "ring-2 ring-primary",
              )}
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={tile.imageSrc}
                  alt={tile.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-[1.03]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                />
                <p className="absolute bottom-4 left-4 right-4 text-xl font-semibold text-white drop-shadow sm:text-2xl">
                  {tile.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default WindowTileGrid;
