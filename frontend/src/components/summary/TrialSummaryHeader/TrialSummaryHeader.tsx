import { useState } from 'react';
import { Bookmark, BookmarkCheck, Check, ExternalLink, Mail, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ContactDialog from '@/components/contact/ContactDialog/ContactDialog';
import TrialTitle from '@/components/summary/TrialTitle/TrialTitle';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { publicTrialId } from '@/lib/trial';
import { TRIAL_SOURCE_CODES, TRIAL_SOURCES } from '@/constants/trialSources';
import type { Trial } from '@/types/trial';

interface TrialSummaryHeaderProps {
  trial: Trial;
  onClose?: () => void;
  onAddToContext?: (trialRef: string) => void;
  isInContext?: boolean;
  onToggleBookmark?: (trialRef: string) => void;
  isBookmarked?: boolean;
  selectedSiteName?: string | null;
}

function TrialSummaryHeader({
  trial,
  onClose,
  onAddToContext,
  isInContext,
  onToggleBookmark,
  isBookmarked,
  selectedSiteName,
}: TrialSummaryHeaderProps) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const [contactOpen, setContactOpen] = useState(false);
  const title = trial.officialTitleEn ?? trial.shortTitleEn ?? publicTrialId(trial) ?? 'Trial';
  // One outbound link per registry that lists the trial, in source order.
  const registryLinks = TRIAL_SOURCE_CODES.flatMap((source) => {
    const key = trial.sourceKeys[source];
    return key ? [{ source, href: TRIAL_SOURCES[source].href(key) }] : [];
  });

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
        {trial.trialRef && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('contact.cta')}
                  onClick={() => setContactOpen(true)}
                >
                  <Mail />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('contact.cta')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        {registryLinks.map(({ source, href }, index) => {
          const label = t('summary.viewOn', { registry: TRIAL_SOURCES[source].registry });
          return (
            <TooltipProvider key={source}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    data-tour={index === 0 ? 'trial-link' : undefined}
                    aria-label={label}
                  >
                    <a href={href} target="_blank" rel="noreferrer">
                      <ExternalLink />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
        {onClose && (
          <Button variant="ghost" size="icon" aria-label={t('summary.close')} onClick={onClose}>
            <X />
          </Button>
        )}
      </div>
      {trial.trialRef && (
        <ContactDialog
          trialRef={trial.trialRef}
          publicTrialId={publicTrialId(trial)}
          preselectedSiteName={selectedSiteName}
          open={contactOpen}
          onOpenChange={setContactOpen}
        />
      )}
    </div>
  );
}

export default TrialSummaryHeader;
