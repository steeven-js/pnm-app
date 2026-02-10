import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { GlossaryTerm } from '@/types';

type GlossaryTooltipProps = {
    term: GlossaryTerm;
    children?: React.ReactNode;
};

export function GlossaryTooltip({ term, children }: GlossaryTooltipProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="border-primary/30 cursor-help border-b border-dashed font-medium">
                    {children || term.abbreviation || term.term}
                </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs" side="top">
                <div className="space-y-1">
                    <p className="text-xs font-semibold">
                        {term.abbreviation && <span className="mr-1 font-mono">{term.abbreviation}</span>}
                        {term.term}
                    </p>
                    <p className="text-primary-foreground/80 text-xs">{term.definition}</p>
                </div>
            </TooltipContent>
        </Tooltip>
    );
}
