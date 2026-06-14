import type { ReactNode } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface TermDefinitionProps {
  term: ReactNode;
  definition: string;
}

function TermDefinition({ term, definition }: TermDefinitionProps) {
  return (
    <HoverCard closeDelay={0} openDelay={0}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={`Definition: ${definition}`}
          className="text-foreground decoration-muted-foreground/60 hover:decoration-foreground cursor-help underline decoration-dotted decoration-1 underline-offset-4"
        >
          {term}
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <p className="text-muted-foreground text-sm leading-relaxed">{definition}</p>
      </HoverCardContent>
    </HoverCard>
  );
}

export default TermDefinition;
