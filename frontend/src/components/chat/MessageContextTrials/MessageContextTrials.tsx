import { Sparkles } from 'lucide-react';
import { MessageAttachments } from '@/components/ai-elements/message';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';
import type { TrialSummary } from '@/types/trial';

interface MessageContextTrialsProps {
  trialRefs: string[];
  fetchTrial: (trialRef: string, signal?: AbortSignal) => Promise<TrialSummary>;
  onSelect?: (trialRef: string) => void;
}

function MessageContextTrials({ trialRefs, fetchTrial, onSelect }: MessageContextTrialsProps) {
  if (trialRefs.length === 0) {
    return null;
  }

  return (
    <MessageAttachments className="items-center gap-1">
      <Sparkles className="text-primary size-3 shrink-0" />
      {trialRefs.map((trialRef) => (
        <TrialCitation
          key={trialRef}
          trialRef={trialRef}
          fetchTrial={fetchTrial}
          onSelect={onSelect}
          compact
        />
      ))}
    </MessageAttachments>
  );
}

export default MessageContextTrials;
