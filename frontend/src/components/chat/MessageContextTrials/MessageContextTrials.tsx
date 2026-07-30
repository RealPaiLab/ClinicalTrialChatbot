import { Sparkles } from 'lucide-react';
import { MessageAttachments } from '@/components/ai-elements/message';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';
import type { TrialSummary } from '@/types/trial';

interface MessageContextTrialsProps {
  nctNumbers: string[];
  fetchTrial: (nctNumber: string, signal?: AbortSignal) => Promise<TrialSummary>;
  onSelect?: (nctNumber: string) => void;
}

function MessageContextTrials({ nctNumbers, fetchTrial, onSelect }: MessageContextTrialsProps) {
  if (nctNumbers.length === 0) {
    return null;
  }

  return (
    <MessageAttachments className="items-center gap-1">
      <Sparkles className="text-primary size-3 shrink-0" />
      {nctNumbers.map((nctNumber) => (
        <TrialCitation
          key={nctNumber}
          nctNumber={nctNumber}
          fetchTrial={fetchTrial}
          onSelect={onSelect}
          compact
        />
      ))}
    </MessageAttachments>
  );
}

export default MessageContextTrials;
