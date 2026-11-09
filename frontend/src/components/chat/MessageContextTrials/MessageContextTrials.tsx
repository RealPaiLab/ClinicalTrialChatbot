import { Sparkles } from 'lucide-react';
import { MessageAttachments } from '@/components/ai-elements/message';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';

interface MessageContextTrialsProps {
  trialRefs: string[];
  onSelect: (trialRef: string) => void;
}

function MessageContextTrials({ trialRefs, onSelect }: MessageContextTrialsProps) {
  if (trialRefs.length === 0) {
    return null;
  }

  return (
    <MessageAttachments className="items-center gap-1">
      <Sparkles className="text-primary size-3 shrink-0" />
      {trialRefs.map((trialRef) => (
        <TrialCitation key={trialRef} trialRef={trialRef} onSelect={onSelect} compact />
      ))}
    </MessageAttachments>
  );
}

export default MessageContextTrials;
