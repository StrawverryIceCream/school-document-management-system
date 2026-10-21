import type { SectorConfig } from "@/lib/sectors/sectors-config";

export default function SectorHeader({ sector }: { sector: SectorConfig }) {
  const Icon = sector.icon;

  return (
    <header className="flex flex-col gap-2 border-b pb-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {sector.name}
          </h1>
          <p className="text-sm text-muted-foreground">{sector.description}</p>
        </div>
      </div>
    </header>
  );
}
