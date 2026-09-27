import { useWindowView } from "@/hooks/useWindowView";
import { TILES } from "@/pages/Windows";
import WindowTileCard from "@/components/window/WindowTileCard";

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
          <WindowTileCard
            key={tile.id}
            tile={tile}
            active={activeView === tile.id}
            onSelect={() => selectView(tile.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default WindowTileGrid;