import { ClipboardList } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageResponse } from '@/components/ai-elements/message';
import TrialSummaryHeader from '@/components/summary/TrialSummaryHeader/TrialSummaryHeader';
import TrialFacts from '@/components/summary/TrialFacts/TrialFacts';
import TrialCriteria from '@/components/summary/TrialCriteria/TrialCriteria';
import type { Trial } from '@/types/trial';

const EMPTY_TITLE = 'No trial selected';
const EMPTY_DESCRIPTION =
  'Select a trial on the map or tap a citation in the chat to see its details.';

interface TrialSummaryPanelProps {
  trial: Trial | null;
  onClose?: () => void;
}

function TrialSummaryPanel({ trial, onClose }: TrialSummaryPanelProps) {
  if (!trial) {
    return (
      <div className="bg-background text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <ClipboardList className="size-6" />
        <p className="text-sm">{EMPTY_TITLE}</p>
        <p className="text-caption max-w-xs">{EMPTY_DESCRIPTION}</p>
      </div>
    );
  }

  return (
    <div className="bg-background flex h-full flex-col">
      <TrialSummaryHeader trial={trial} onClose={onClose} />
      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 p-4">
          <TrialFacts trial={trial} />
          {trial.descriptionEn && (
            <MessageResponse className="text-muted-foreground text-sm leading-relaxed">
              {trial.descriptionEn}
            </MessageResponse>
          )}
          <TrialCriteria trial={trial} />
        </div>
      </ScrollArea>
    </div>
  );
}

export default TrialSummaryPanel;
