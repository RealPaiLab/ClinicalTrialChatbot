import { Bookmark, Compass, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { BOOKMARKS } from '@/constants/bookmarks';
import { TRIAL_DATA } from '@/constants/chat';

const TITLE = 'Cancer Clinical Trial Navigator';

interface AppHeaderProps {
  dark: boolean;
  bookmarkCount: number;
  onOpenBookmarks: () => void;
  onStartTour: () => void;
  onToggleTheme: () => void;
}

function AppHeader({
  dark,
  bookmarkCount,
  onOpenBookmarks,
  onStartTour,
  onToggleTheme,
}: AppHeaderProps) {
  return (
    <header className="bg-header text-header-foreground border-border after:bg-amber relative flex h-12 shrink-0 items-center justify-between border-b px-4 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:content-['']">
      <div className="flex items-center gap-2.5">
        <span className="text-eyebrow">{TITLE}</span>
        <span className="text-eyebrow text-primary bg-primary/10 rounded-full px-2 py-0.5 font-bold">
          Pre-Release Version
        </span>
      </div>
      <div className="flex items-center gap-1">
        <HoverCard openDelay={100} closeDelay={0}>
          <HoverCardTrigger asChild>
            <button
              type="button"
              aria-label={TRIAL_DATA.detailedNotice}
              className="text-header-foreground/80 hover:text-header-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5 transition-colors"
            >
              <span className="text-eyebrow text-[0.65rem] font-bold">
                {TRIAL_DATA.lastUpdatedLabel}
              </span>
              <span
                aria-hidden
                className="border-header-foreground/40 flex size-3 items-center justify-center rounded-full border text-[0.55rem] leading-none font-bold"
              >
                ?
              </span>
            </button>
          </HoverCardTrigger>
          <HoverCardContent align="end" className="w-72 text-sm leading-relaxed">
            {TRIAL_DATA.detailedNotice}
          </HoverCardContent>
        </HoverCard>

        <Button
          variant="ghost"
          size="icon"
          data-tour="bookmarks"
          onClick={onOpenBookmarks}
          aria-label={`${BOOKMARKS.triggerLabel} (${bookmarkCount})`}
          className="relative"
        >
          <Bookmark />
          {bookmarkCount > 0 && (
            <span className="bg-primary text-primary-foreground absolute top-0.5 right-0.5 flex size-3.5 items-center justify-center rounded-full font-mono text-[0.55rem] leading-none font-bold">
              {bookmarkCount}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={onStartTour} aria-label="Take a tour">
          <Compass />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label={dark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}

export default AppHeader;
