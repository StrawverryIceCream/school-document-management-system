import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import TruncatedText from "@/components/shared/TruncatedText";
import { cn } from "@/lib/utils";

export interface CopyableIdProps {
  id?: string | number | null;
  displayValue?: string;
  className?: string;
  codeClassName?: string;
  label?: string;
}

export default function CopyableId({
  id,
  displayValue,
  className,
  codeClassName,
  label = "Copy ID",
}: CopyableIdProps) {
  const [copied, setCopied] = useState(false);

  if (id === undefined || id === null || id === "") {
    return <span className="text-muted-foreground">—</span>;
  }

  const strId = String(id);
  const displayText = displayValue ?? strId;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(strId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <TruncatedText
        text={strId}
        className={cn(
          "max-w-32 font-mono text-sm text-muted-foreground",
          codeClassName,
        )}
      >
        <code>{displayText}</code>
      </TruncatedText>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={label}
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
        ) : (
          <Copy className="size-3.5 text-muted-foreground" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
