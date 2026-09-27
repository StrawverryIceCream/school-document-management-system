import type { CSSProperties } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WindowTile } from "@/pages/Windows";

interface WindowTileCardProps {
  tile: WindowTile;
  active: boolean;
  onSelect: () => void;
}

function WindowTileCard({ tile, active, onSelect }: WindowTileCardProps) {
  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect();
      }}
      className={cn(active && "active-tile")}
      style={{
        cursor: "pointer",
        padding: 0,
        ...(active ? { boxShadow: "0 0 0 2px var(--primary)" } : {}),
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
  );
}

export default WindowTileCard;