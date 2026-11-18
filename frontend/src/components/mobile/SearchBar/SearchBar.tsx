import { useState } from 'react';
import { Bookmark, Compass, FileText, Languages, Menu, Moon, Sun, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import LanguageOptions from '@/components/language/LanguageOptions/LanguageOptions';
import BrandTitle from '@/components/layout/BrandTitle/BrandTitle';
import CamilleIcon from '@/components/layout/CamilleIcon/CamilleIcon';
import CornerMark from '@/components/layout/CornerMark/CornerMark';
import OicrLogo from '@/components/layout/OicrLogo/OicrLogo';
import { AGENT_NAME } from '@/constants/chat';
import { LANGUAGE_TARGETS } from '@/constants/language';
import { useAppLanguage } from '@/hooks/useAppLanguage';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/appStore';

interface SearchBarProps {
  onOpenChat: () => void;
  onOpenBookmarks: () => void;
  onStartTour: () => void;
}

const MENU_ROW = 'h-11 justify-start gap-3 px-3 text-sm';
const HIGHLIGHT_EDGE =
  "after:bg-highlight relative overflow-hidden after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:content-['']";

function SearchBar({ onOpenChat, onOpenBookmarks, onStartTour }: SearchBarProps) {
  const { t } = useTranslation();
  const { language } = useAppLanguage();
  const title = useAppStore((state) => state.conversationTitle);
  const dark = useAppStore((state) => state.theme === 'dark');
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const bookmarkCount = useAppStore((state) => state.bookmarkedTrialRefs.length);
  const [languageOpen, setLanguageOpen] = useState(false);
  const current = LANGUAGE_TARGETS.find((option) => option.code === language);

  return (
    <div className="absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] z-10 flex items-stretch gap-2">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('mobile.menu')}
            className={cn(
              'bg-card border-border size-14 shrink-0 rounded-xl border shadow-md',
              HIGHLIGHT_EDGE
            )}
          >
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false} className="gap-0 overflow-hidden p-0">
          <CornerMark className="top-0 right-0" />
          <CornerMark className="bottom-0 left-0 rotate-180" />

          <SheetHeader className="group relative gap-3 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
            <div className="flex items-center gap-3">
              <OicrLogo className="h-10" />
              <span aria-hidden className="bg-border h-7 w-px shrink-0" />
              <CamilleIcon className="h-9" />
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('summary.close')}
                  className="ml-auto"
                >
                  <X />
                </Button>
              </SheetClose>
            </div>
            <SheetTitle className="sr-only">{AGENT_NAME}</SheetTitle>
            <BrandTitle className="gap-1.5" />
          </SheetHeader>

          <nav className="flex flex-col gap-1 px-3">
            <Separator className="mb-1.5" />
            <Button variant="ghost" className={MENU_ROW} onClick={onOpenBookmarks}>
              <Bookmark data-icon="inline-start" />
              {t('header.savedTrials')}
              {bookmarkCount > 0 && <span className="ml-auto font-mono">{bookmarkCount}</span>}
            </Button>
            <SheetClose asChild>
              <Button variant="ghost" className={MENU_ROW} onClick={onStartTour}>
                <Compass data-icon="inline-start" />
                {t('header.takeTour')}
              </Button>
            </SheetClose>
            <Separator className="my-1.5" />
            <Button variant="ghost" className={MENU_ROW} onClick={() => setLanguageOpen(true)}>
              <Languages data-icon="inline-start" />
              {t('header.language')}
              {current && (
                <span
                  className="text-muted-foreground ml-auto truncate text-xs"
                  lang={current.code}
                >
                  {current.flag} {current.endonym}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              className={MENU_ROW}
              aria-label={dark ? t('header.switchToLight') : t('header.switchToDark')}
              onClick={toggleTheme}
            >
              {dark ? <Moon data-icon="inline-start" /> : <Sun data-icon="inline-start" />}
              {t('mobile.theme')}
              <span className="text-muted-foreground ml-auto text-xs">
                {dark ? t('mobile.themeDark') : t('mobile.themeLight')}
              </span>
            </Button>
            <Separator className="my-1.5" />
          </nav>

          <footer className="mt-auto flex flex-col gap-1 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <Separator className="mb-1" />
            <Button variant="ghost" className={cn(MENU_ROW, 'text-muted-foreground')} asChild>
              <Link to="/terms">
                <FileText data-icon="inline-start" />
                {t('footer.terms')}
              </Link>
            </Button>
          </footer>
        </SheetContent>
      </Sheet>

      <Dialog open={languageOpen} onOpenChange={setLanguageOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('languageGate.title')}</DialogTitle>
            <DialogDescription>{t('languageGate.description')}</DialogDescription>
          </DialogHeader>
          <LanguageOptions onSelect={() => setLanguageOpen(false)} />
        </DialogContent>
      </Dialog>

      <button
        type="button"
        data-tour="mobile-search"
        onClick={onOpenChat}
        className={cn(
          'bg-card border-border flex h-14 min-w-0 flex-1 items-center rounded-xl border px-3.5 text-left shadow-md',
          HIGHLIGHT_EDGE
        )}
      >
        <span
          className={cn(
            'line-clamp-2 text-[clamp(0.8rem,3.6vw,0.95rem)] leading-snug',
            title ? 'font-display font-semibold' : 'text-muted-foreground'
          )}
        >
          {title ?? t('mobile.searchPrompt')}
        </span>
      </button>
    </div>
  );
}

export default SearchBar;
