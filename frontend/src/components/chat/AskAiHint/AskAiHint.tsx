import { HelpCircle, Sparkles } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

function AskAiHint() {
  const { t } = useTranslation();

  return (
    <HoverCard openDelay={100} closeDelay={0}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          aria-label={t('chat.askAiHint')}
          className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
        >
          <HelpCircle className="size-3.5" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-64 text-sm leading-relaxed">
        <Trans
          i18nKey="chat.askAiHintBody"
          components={{
            mark: <mark className="bg-amber/40 text-foreground rounded px-1" />,
            ask: (
              <span className="text-foreground inline-flex items-center gap-0.5 align-baseline font-medium underline underline-offset-2">
                <Sparkles className="size-3" />
              </span>
            ),
          }}
        />
      </HoverCardContent>
    </HoverCard>
  );
}

export default AskAiHint;
