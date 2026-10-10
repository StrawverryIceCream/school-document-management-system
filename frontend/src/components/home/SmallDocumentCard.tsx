import { ArrowUpRight, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DocumentTypeItem } from "@/lib/document";
import { ICON_BOX_BASE, ICON_TONES } from "@/lib/icon-tones";



type SmallDocumentCardProps = Omit<
  React.ComponentProps<typeof Card>,
  "children"
> & {
  document: DocumentTypeItem;
  onApply: (documentId: string) => void;
};

function SmallDocumentCard({
  className,
  document,
  onApply,
}: SmallDocumentCardProps) {
  const {
    id,
    title,
    description,
    price,
    turnaround,
    isExpress,
    icon: Icon,
    tone,
  } = document;
  const TurnaroundIcon = isExpress ? Zap : Clock;

  return (
    <Card className={cn("gap-4 rounded-2xl border-0 p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className={cn(ICON_BOX_BASE, "size-14 ", ICON_TONES[tone])}>
          <Icon className="size-6" aria-hidden="true" />
        </div>
        <Badge
          variant="outline"
          className="rounded-full px-2.5 py-1 text-base font-semibold text-muted-foreground"
        >
          {formatPeso(price)}
        </Badge>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="line-clamp-2 min-h-5 text-2xl font-bold leading-7 text-foreground">
          {title}
        </h3>
        <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground font-mono">
          {description}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <TurnaroundIcon className="size-4 shrink-0" aria-hidden="true" />
          <span className="max-w-24">{turnaround}</span>
        </span>
        <Button
          size="default"
          onClick={() => onApply(id)}
          aria-label={`Apply for ${title}`}
        >
          Apply
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Button>
      </div>
    </Card>
  );
}

export default SmallDocumentCard;
