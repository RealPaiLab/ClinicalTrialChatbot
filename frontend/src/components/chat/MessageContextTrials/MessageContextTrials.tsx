import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MessageAttachments } from '@/components/ai-elements/message';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

const MAX_INLINE_TRIALS = 2;

interface MessageContextTrialsProps {
  trialRefs: string[];
  onSelect: (trialRef: string) => void;
}

function MessageContextTrials({ trialRefs, onSelect }: MessageContextTrialsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  if (trialRefs.length === 0) {
    return null;
  }

  const citations = trialRefs.map((trialRef) => (
    <TrialCitation key={trialRef} trialRef={trialRef} onSelect={onSelect} compact />
  ));

  return (
    <MessageAttachments className="items-center gap-1">
      <Sparkles className="text-primary size-3 shrink-0" />
      {trialRefs.length <= MAX_INLINE_TRIALS ? (
        citations
      ) : (
        // A tap toggles it too, since touch never hovers.
        <HoverCard open={open} onOpenChange={setOpen} openDelay={100} closeDelay={100}>
          <HoverCardTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
              className="h-5 rounded-full px-2 text-[0.7rem] font-medium"
            >
              {t('chat.contextTrials', { count: trialRefs.length })}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent
            align="end"
            className="flex w-auto max-w-72 flex-col items-start gap-1.5"
          >
            {citations}
          </HoverCardContent>
        </HoverCard>
      )}
    </MessageAttachments>
  );
}

export default MessageContextTrials;
