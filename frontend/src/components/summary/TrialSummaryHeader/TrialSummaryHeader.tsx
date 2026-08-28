import { Bookmark, BookmarkCheck, Check, ExternalLink, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TrialTitle from '@/components/summary/TrialTitle/TrialTitle';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { publicTrialId } from '@/lib/trial';
import type { Trial } from '@/types/trial';

const TRIAL_URL_BASE = 'https://www.cancertrialscanada.ca/trial/';

interface TrialSummaryHeaderProps {
  trial: Trial;
  onClose?: () => void;
  onAddToContext?: (trialRef: string) => void;
  isInContext?: boolean;
  onToggleBookmark?: (trialRef: string) => void;
  isBookmarked?: boolean;
}

function TrialSummaryHeader({
  trial,
  onClose,
  onAddToContext,
  isInContext,
  onToggleBookmark,
  isBookmarked,
}: TrialSummaryHeaderProps) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const title = trial.officialTitleEn ?? trial.shortTitleEn ?? publicTrialId(trial) ?? 'Trial';
  const trialUrl = trial.acronymOrProtocolId
    ? `${TRIAL_URL_BASE}${encodeURIComponent(trial.acronymOrProtocolId)}`
    : null;

  return (
    <div className="border-border flex items-start justify-between gap-3 border-b p-4">
      <div className="flex min-w-0 flex-col gap-1">
        {publicTrialId(trial) && (
          <span className="text-eyebrow text-primary font-mono">{publicTrialId(trial)}</span>
        )}
        <TrialTitle key={title} title={title} lang={language} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {onAddToContext && trial.trialRef && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-tour="add-context"
                  aria-label={isInContext ? t('summary.addedToChat') : t('summary.askAbout')}
                  disabled={isInContext}
                  onClick={() => onAddToContext(trial.trialRef as string)}
                >
                  {isInContext ? <Check className="text-recruiting" /> : <Sparkles />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isInContext ? t('summary.addedToChatHint') : t('summary.askAbout')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {onToggleBookmark && trial.trialRef && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-tour="bookmark"
                  aria-label={isBookmarked ? t('bookmarks.remove') : t('bookmarks.add')}
                  onClick={() => onToggleBookmark(trial.trialRef as string)}
                >
                  {isBookmarked ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isBookmarked ? t('bookmarks.added') : t('bookmarks.add')}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {trialUrl && (
          <Button
            asChild
            variant="ghost"
            size="icon"
            data-tour="trial-link"
            aria-label={t('summary.viewOnCtc')}
          >
            <a href={trialUrl} target="_blank" rel="noreferrer">
              <ExternalLink />
            </a>
          </Button>
        )}
        {onClose && (
          <Button variant="ghost" size="icon" aria-label={t('summary.close')} onClick={onClose}>
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

export default TrialSummaryHeader;
