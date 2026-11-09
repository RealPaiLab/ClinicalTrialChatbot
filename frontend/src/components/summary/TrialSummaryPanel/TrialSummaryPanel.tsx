import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageResponse } from '@/components/ai-elements/message';
import TrialSummaryHeader, {
  TrialSummaryActions,
} from '@/components/summary/TrialSummaryHeader/TrialSummaryHeader';
import TrialFacts from '@/components/summary/TrialFacts/TrialFacts';
import TrialCriteria from '@/components/summary/TrialCriteria/TrialCriteria';
import { TranslationSource } from '@/constants/language';
import { useTrialTranslation } from '@/hooks/useTrialTranslation';
import { useSelectedTrial } from '@/hooks/useWorkspace';

interface TrialSummaryPanelProps {
  onClose: () => void;
  /** Lets a layout react once the trial joins the chat context. */
  onAddedToContext?: () => void;
  /** Puts the trial actions in a bar pinned under the scrolling details. */
  actionBar?: boolean;
}

function TranslationSkeleton() {
  return (
    <div className="flex flex-col gap-5 p-4">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

function TrialSummaryPanel({ onClose, onAddedToContext, actionBar }: TrialSummaryPanelProps) {
  const { t } = useTranslation();
  const { trial: selected, siteKey } = useSelectedTrial();
  const { trial, isPending, source } = useTrialTranslation(selected);

  if (!trial) {
    return (
      <div className="bg-card text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
        <ClipboardList className="size-6" />
        <p className="text-sm">{t('summary.emptyTitle')}</p>
        <p className="text-caption max-w-xs">{t('summary.emptyDescription')}</p>
      </div>
    );
  }

  const notice =
    source === TranslationSource.Machine
      ? t('summary.machineNotice')
      : source === TranslationSource.Unavailable
        ? t('summary.unavailableNotice')
        : null;

  return (
    <div className="bg-card flex h-full flex-col">
      <TrialSummaryHeader
        trial={trial}
        onClose={onClose}
        onAddedToContext={onAddedToContext}
        hideActions={actionBar}
      />
      <ScrollArea className="min-h-0 flex-1">
        {isPending ? (
          <TranslationSkeleton />
        ) : (
          <div className="flex flex-col gap-5 p-4">
            <TrialFacts trial={trial} siteKey={siteKey} />
            {trial.descriptionEn && (
              <MessageResponse className="text-muted-foreground text-sm leading-relaxed">
                {trial.descriptionEn}
              </MessageResponse>
            )}
            <TrialCriteria trial={trial} />
            {notice && <p className="text-caption text-muted-foreground border-t pt-3">{notice}</p>}
          </div>
        )}
      </ScrollArea>
      {actionBar && (
        <div className="border-border flex items-stretch gap-1 border-t px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <TrialSummaryActions trial={trial} onAddedToContext={onAddedToContext} labelled />
        </div>
      )}
    </div>
  );
}

export default TrialSummaryPanel;
