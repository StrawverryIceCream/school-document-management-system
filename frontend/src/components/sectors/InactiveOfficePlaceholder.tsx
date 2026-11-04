import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface InactiveOfficePlaceholderProps {
  title?: string;
  description?: string;
  fallbackUrl: string;
}

export default function InactiveOfficePlaceholder({
  title = "Office Currently Inactive",
  description = "This office is currently not issuing documents online. No active document forms are available at this time.",
  fallbackUrl,
}: InactiveOfficePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center shadow-xs">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-4">
        <AlertCircle className="size-7" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground break-words">{title}</h3>
      <p className="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" asChild>
          <Link to={fallbackUrl} className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Browse Active Services
          </Link>
        </Button>
      </div>
    </div>
  );
}
