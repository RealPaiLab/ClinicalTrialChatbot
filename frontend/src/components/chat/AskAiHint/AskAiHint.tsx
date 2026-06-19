import { HelpCircle, Sparkles } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

function AskAiHint() {
  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label="How to get a term explained"
          className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
        >
          <HelpCircle className="size-3.5" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 text-sm leading-relaxed">
        Don't understand a word?{' '}
        <mark className="bg-amber/40 text-foreground rounded px-1">Highlight</mark> it in the
        conversation and click the{' '}
        <span className="text-foreground inline-flex items-center gap-0.5 align-baseline font-medium underline underline-offset-2">
          <Sparkles className="size-3" />
          Ask AI
        </span>{' '}
        button that appears, and Camille will explain it.
      </HoverCardContent>
    </HoverCard>
  );
}

export default AskAiHint;
