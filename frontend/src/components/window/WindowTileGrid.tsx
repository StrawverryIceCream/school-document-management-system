import type { CSSProperties } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useWindowView } from "@/hooks/useWindowView";
import { TILES } from "@/pages/Windows";

function WindowTileGrid() {
  const { activeView, selectView } = useWindowView();

  return (
    <div style={{ minHeight: "100%", padding: "2.5rem" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.875rem", fontWeight: 700 }}>Windows</h1>
        <p style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
          Choose a college or department
        </p>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2.5rem",
        }}
      >
        {TILES.map((tile) => (
          <Card
            key={tile.id}
            role="button"
            tabIndex={0}
            onClick={() => selectView(tile.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") selectView(tile.id);
            }}
            className={cn(activeView === tile.id && "active-tile")}
            style={{
              cursor: "pointer",
              padding: 0,
              ...(activeView === tile.id
                ? { boxShadow: "0 0 0 2px var(--primary)" }
                : {}),
            } as CSSProperties}
          >
            <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
              <img
                src={tile.imageSrc}
                alt={tile.title}
                style={{
                  position: "absolute",
                  inset: 0,
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                }}
              />
              <p
                style={{
                  position: "absolute",
                  bottom: "0.5rem",
                  left: "0.75rem",
                  right: "0.75rem",
                  fontSize: "1.5rem",
                  fontWeight: 600,
                  color: "white",
                  textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                }}
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