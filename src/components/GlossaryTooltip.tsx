import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GLOSSARY } from "@/lib/library";

export function GlossaryTooltip({ term, children }: { term: string; children?: React.ReactNode }) {
  const definition = GLOSSARY[term] ?? "No definition available yet.";
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="cursor-help rounded-sm underline decoration-dotted decoration-primary/60 underline-offset-4"
            aria-label={`What does ${term} mean?`}
          >
            {children ?? term}
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm leading-relaxed">
          <p className="font-semibold">{term}</p>
          <p>{definition}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
