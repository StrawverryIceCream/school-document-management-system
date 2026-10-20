import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface TruncatedTextProps {
  text: string;
  className?: string;
  children?: ReactNode;
  delayDuration?: number;
}

export default function TruncatedText({
  text,
  className,
  children,
  delayDuration = 200,
}: TruncatedTextProps) {
  if (!text) {
    return <span className={className}>—</span>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("block truncate cursor-default", className)}>
            {children ?? text}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs wrap-break-word">
          <span>{text}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
