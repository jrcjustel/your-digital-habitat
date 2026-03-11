import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import glossary, { getGlossaryEntry } from "@/data/glossary";

interface GlossaryTooltipProps {
  /** Key from glossary.ts (e.g. "npl", "cdr", "dacion") */
  termKey: string;
  /** Override display text — defaults to the glossary term */
  children?: ReactNode;
  /** Show the (?) icon after the text */
  showIcon?: boolean;
  /** Show the longer explanation below the short one */
  showLong?: boolean;
}

const GlossaryTooltip = ({
  termKey,
  children,
  showIcon = true,
  showLong = true,
}: GlossaryTooltipProps) => {
  const entry = getGlossaryEntry(termKey);
  if (!entry) return <>{children ?? termKey}</>;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help border-b border-dotted border-muted-foreground/40 hover:border-accent transition-colors">
            <span>{children ?? entry.term}</span>
            {showIcon && (
              <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            )}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          align="center"
          className="max-w-xs p-3 space-y-1.5"
        >
          <p className="text-xs font-bold text-foreground">{entry.term}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {entry.short}
          </p>
          {showLong && entry.long && (
            <p className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border pt-1.5">
              {entry.long}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default GlossaryTooltip;
