import { Bookmark, Compass, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import BrandTitle from '@/components/layout/BrandTitle/BrandTitle';
import CamilleIcon from '@/components/layout/CamilleIcon/CamilleIcon';
import LanguagePicker from '@/components/layout/LanguagePicker/LanguagePicker';
import OicrLogo from '@/components/layout/OicrLogo/OicrLogo';
import { TRIAL_SOURCES } from '@/constants/trialSources';
import { useDataFreshness } from '@/hooks/useDataFreshness';
import { useAppStore } from '@/store/appStore';

interface AppHeaderProps {
  onOpenBookmarks: () => void;
  onStartTour: () => void;
}

function AppHeader({ onOpenBookmarks, onStartTour }: AppHeaderProps) {
  const { t } = useTranslation();
  const dark = useAppStore((state) => state.theme === 'dark');
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const bookmarkCount = useAppStore((state) => state.bookmarkedTrialRefs.length);
  const { updatedOn, sources } = useDataFreshness();
  const lastUpdated = updatedOn ? t('data.lastUpdated', { date: updatedOn.toUpperCase() }) : null;
  const notice = updatedOn ? t('data.detailedNotice', { date: updatedOn }) : t('data.shortNotice');

  return (
    <header className="bg-header text-header-foreground border-border after:bg-highlight relative flex h-12 shrink-0 items-center justify-between border-b px-4 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:content-['']">
      <div className="flex min-w-0 items-center gap-2.5">
        <OicrLogo className="h-9" />
        <span aria-hidden className="bg-border h-6 w-px" />
        <div className="group flex min-w-0 items-center gap-2">
          <CamilleIcon className="h-9" />
          <BrandTitle
            className="gap-0.5"
            taglineClassName="hidden truncate leading-none lg:block"
          />
        </div>
      </div>
      <div className="flex items-center gap-1">
        <HoverCard openDelay={100} closeDelay={0}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              aria-label={notice}
              className="group/updated text-header-foreground/80 hover:text-header-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors"
            >
              {lastUpdated && (
                <span className="text-eyebrow text-[0.65rem] font-bold">{lastUpdated}</span>
              )}
              <span
                aria-hidden
                className="border-header-foreground/40 group-hover/updated:border-highlight group-hover/updated:text-highlight flex size-3 items-center justify-center rounded-full border text-[0.55rem] leading-none font-bold transition-colors"
              >
                ?
              </span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-72 text-sm leading-relaxed">
            <p>{notice}</p>
            {sources.length > 0 && (
              <ul className="border-border mt-2 space-y-1 border-t pt-2">
                {sources.map(({ source, updatedOn: date }) => (
                  <li key={source} className="flex justify-between gap-3">
                    <span>{TRIAL_SOURCES[source].label}</span>
                    <span className="text-muted-foreground shrink-0 font-mono text-xs">
                      {date ?? t('data.notYet')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </HoverCardContent>
        </HoverCard>

        <LanguagePicker />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="action"
                size="icon"
                data-tour="bookmarks"
                onClick={onOpenBookmarks}
                aria-label={`${t('header.savedTrials')} (${bookmarkCount})`}
                className="relative"
              >
                <Bookmark />
                {bookmarkCount > 0 && (
                  <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 flex size-3.5 items-center justify-center rounded-full font-mono text-[0.55rem] leading-none font-bold">
                    {bookmarkCount}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('header.savedTrials')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="action"
                size="icon"
                onClick={onStartTour}
                aria-label={t('header.takeTour')}
              >
                <Compass />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t('header.takeTour')}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="action"
                size="icon"
                onClick={toggleTheme}
                aria-label={dark ? t('header.switchToLight') : t('header.switchToDark')}
              >
                {dark ? <Sun /> : <Moon />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {dark ? t('header.switchToLight') : t('header.switchToDark')}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </header>
  );
}

export default AppHeader;
