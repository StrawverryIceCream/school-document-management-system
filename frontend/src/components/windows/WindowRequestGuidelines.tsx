import { ShieldCheck } from "lucide-react";
import { useWindowView } from "@/hooks/useWindowView";

export function WindowRequestGuidelines() {
  const { TILES, activeView } = useWindowView();
  const college = TILES.find((tile) => tile.id === activeView);
  const collegeTitle = college?.title ?? activeView ?? "Department";
  const collegeDescription = college?.description ?? collegeTitle;

  return (
    <section className="flex gap-3 rounded-xl border bg-muted/30 p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ShieldCheck className="size-4" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-sm font-semibold">{collegeDescription} Registrar Desk Guidelines</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Click any request to review details, verify credentials against the student database, and
          update its issuance status. Unclaimed requests automatically re-route after 5 calendar
          days.
        </p>
      </div>
    </section>
  );
}
