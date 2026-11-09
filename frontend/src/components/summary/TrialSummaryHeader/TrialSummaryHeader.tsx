import { useState, type ReactNode } from 'react';
import { Bookmark, BookmarkCheck, Check, ExternalLink, Mail, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ContactDialog from '@/components/contact/ContactDialog/ContactDialog';
import TrialTitle from '@/components/summary/TrialTitle/TrialTitle';
import { TRIAL_SOURCE_CODES, TRIAL_SOURCES } from '@/constants/trialSources';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { useSelectedTrial } from '@/hooks/useWorkspace';
import { findSiteByKey, publicTrialId, trialFullTitle } from '@/lib/trial';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';
import type { Trial } from '@/types/trial';

interface TrialSummaryActionsProps {
  trial: Trial;
  onAddedToContext?: () => void;
  /** Shows a short caption under each icon, as a bottom action bar. */
  labelled?: boolean;
}

interface TrialSummaryHeaderProps extends Omit<TrialSummaryActionsProps, 'labelled'> {
  onClose: () => void;
  /** Leaves the actions out, for layouts that render them as a separate bar. */
  hideActions?: boolean;
}

function Action({ label, children }: { label: string; children: ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function TrialSummaryActions({
  trial,
  onAddedToContext,
  labelled,
}: TrialSummaryActionsProps) {
  const { t } = useTranslation();
  const [contactOpen, setContactOpen] = useState(false);
  const { isInContext, isBookmarked, siteKey } = useSelectedTrial();
  const addToContext = useAppStore((state) => state.addToContext);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);
  const registryLinks = TRIAL_SOURCE_CODES.flatMap((source) => {
    const key = trial.sourceKeys[source];
    return key ? [{ source, href: TRIAL_SOURCES[source].href(key) }] : [];
  });
  const buttonClass = cn(
    labelled && 'h-14 min-w-0 flex-1 basis-0 flex-col gap-1 text-[clamp(0.7rem,2.9vw,0.8rem)]'
  );
  const caption = (text: string) =>
    labelled && <span className="w-full truncate text-center">{text}</span>;

  const handleAddToContext = () => {
    addToContext(trial.trialRef);
    onAddedToContext?.();
  };

  return (
    <>
      <Action label={isInContext ? t('summary.addedToChatHint') : t('summary.askAbout')}>
        <Button
          variant="ghost"
          size="icon"
          data-tour="add-context"
          className={buttonClass}
          aria-label={isInContext ? t('summary.addedToChat') : t('summary.askAbout')}
          disabled={isInContext}
          onClick={handleAddToContext}
        >
          {isInContext ? <Check className="text-recruiting" /> : <Sparkles />}
          {caption(t('mobile.ask'))}
        </Button>
      </Action>
      <Action label={isBookmarked ? t('bookmarks.added') : t('bookmarks.add')}>
        <Button
          variant="ghost"
          size="icon"
          data-tour="bookmark"
          className={buttonClass}
          aria-label={isBookmarked ? t('bookmarks.remove') : t('bookmarks.add')}
          onClick={() => toggleBookmark(trial.trialRef)}
        >
          {isBookmarked ? <BookmarkCheck className="text-primary" /> : <Bookmark />}
          {caption(isBookmarked ? t('bookmarks.added') : t('mobile.save'))}
        </Button>
      </Action>
      <Action label={t('contact.cta')}>
        <Button
          variant="ghost"
          size="icon"
          className={buttonClass}
          aria-label={t('contact.cta')}
          onClick={() => setContactOpen(true)}
        >
          <Mail />
          {caption(t('mobile.contact'))}
        </Button>
      </Action>
      {registryLinks.map(({ source, href }, index) => {
        const label = t('summary.viewOn', { registry: TRIAL_SOURCES[source].registry });
        return (
          <Action key={source} label={label}>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={buttonClass}
              data-tour={index === 0 ? 'trial-link' : undefined}
              aria-label={label}
            >
              <a href={href} target="_blank" rel="noreferrer">
                <ExternalLink />
                {caption(
                  registryLinks.length > 1 ? TRIAL_SOURCES[source].label : t('mobile.listing')
                )}
              </a>
            </Button>
          </Action>
        );
      })}
      <ContactDialog
        trialRef={trial.trialRef}
        publicTrialId={publicTrialId(trial)}
        preselectedSiteName={findSiteByKey(trial, siteKey)?.nameEn}
        open={contactOpen}
        onOpenChange={setContactOpen}
      />
    </>
  );
}

function TrialSummaryHeader({ onClose, hideActions, ...actions }: TrialSummaryHeaderProps) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const { trial } = actions;
  const title = trialFullTitle(trial);
  const id = publicTrialId(trial);

  return (
    <div className="border-border flex items-start justify-between gap-3 border-b p-4">
      <div className="flex min-w-0 flex-col gap-1">
        {id && <span className="text-eyebrow text-primary font-mono">{id}</span>}
        <TrialTitle key={title} title={title} lang={language} />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!hideActions && <TrialSummaryActions {...actions} />}
        <Button variant="ghost" size="icon" aria-label={t('summary.close')} onClick={onClose}>
          <X />
        </Button>
      </div>
    </div>
  );
}

export default TrialSummaryHeader;
