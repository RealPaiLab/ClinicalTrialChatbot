import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface TermDefinitionProps {
  term: ReactNode;
  definition: string;
}

function TermDefinition({ term, definition }: TermDefinitionProps) {
  const { t } = useTranslation();

  return (
    <HoverCard closeDelay={0} openDelay={0}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={t('chat.definition', { definition })}
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
