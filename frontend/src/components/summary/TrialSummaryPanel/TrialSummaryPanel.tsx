import { ClipboardList } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageResponse } from '@/components/ai-elements/message';
import TrialSummaryHeader from '@/components/summary/TrialSummaryHeader/TrialSummaryHeader';
import TrialFacts from '@/components/summary/TrialFacts/TrialFacts';
import TrialCriteria from '@/components/summary/TrialCriteria/TrialCriteria';
import { TranslationSource } from '@/constants/language';
import { useTrialTranslation } from '@/hooks/useTrialTranslation';
import type { Trial } from '@/types/trial';

interface TrialSummaryPanelProps {
  trial: Trial | null;
  onClose?: () => void;
  onAddToContext?: (nctNumber: string) => void;
  isInContext?: boolean;
  onToggleBookmark?: (nctNumber: string) => void;
  isBookmarked?: boolean;
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

function TrialSummaryPanel({
  trial,
  onClose,
  onAddToContext,
  isInContext,
  onToggleBookmark,
  isBookmarked,
}: TrialSummaryPanelProps) {
  const { t } = useTranslation();
  const { trial: displayTrial, isPending, source } = useTrialTranslation(trial);

  if (!displayTrial) {
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
        trial={displayTrial}
        onClose={onClose}
        onAddToContext={onAddToContext}
        isInContext={isInContext}
        onToggleBookmark={onToggleBookmark}
        isBookmarked={isBookmarked}
      />
      <ScrollArea className="min-h-0 flex-1">
        {isPending ? (
          <TranslationSkeleton />
        ) : (
          <div className="flex flex-col gap-5 p-4">
            <TrialFacts trial={displayTrial} />
            {displayTrial.descriptionEn && (
              <MessageResponse className="text-muted-foreground text-sm leading-relaxed">
                {displayTrial.descriptionEn}
              </MessageResponse>
            )}
            <TrialCriteria trial={displayTrial} />
            {notice && <p className="text-caption text-muted-foreground border-t pt-3">{notice}</p>}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

export default TrialSummaryPanel;
