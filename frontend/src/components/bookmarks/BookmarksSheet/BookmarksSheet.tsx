import { useQueries } from '@tanstack/react-query';
import { Bookmark, ChevronRight, FileDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ItemGroup } from '@/components/ui/item';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import BookmarkRow from '@/components/bookmarks/BookmarkRow/BookmarkRow';
import { useCachedTrialTranslations } from '@/hooks/useTrialTranslation';
import { useTrialPdfExport } from '@/hooks/useTrialPdfExport';
import { trialQuery } from '@/services/trials';
import { useAppStore } from '@/store/appStore';
import type { Trial } from '@/types/trial';

interface BookmarksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function BookmarksSheet({ open, onOpenChange }: BookmarksSheetProps) {
  const { t } = useTranslation();
  const bookmarkedTrialRefs = useAppStore((state) => state.bookmarkedTrialRefs);
  const removeBookmark = useAppStore((state) => state.removeBookmark);
  const openTrial = useAppStore((state) => state.openTrial);
  const { exportTrials, isExporting } = useTrialPdfExport();
  const results = useQueries({
    queries: bookmarkedTrialRefs.map((trialRef) => ({ ...trialQuery(trialRef), enabled: open })),
  });

  const loadedTrials = results
    .map((result) => result.data)
    .filter((trial): trial is Trial => Boolean(trial));
  const rowTrials = useCachedTrialTranslations(loadedTrials);

  // Rows hand back the possibly translated copy; opening and exporting need the stored English one.
  const english = (trial: Trial) =>
    loadedTrials.find((loaded) => loaded.trialRef === trial.trialRef) ?? trial;

  const handleSelect = (trial: Trial) => {
    openTrial(english(trial));
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton={false} className="w-full gap-0 p-0 sm:max-w-md">
        <SheetClose
          aria-label={t('bookmarks.close')}
          className="border-border bg-popover text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 -left-4 flex h-16 w-4 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-full border border-r-0 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronRight className="size-3" />
        </SheetClose>

        <SheetHeader className="border-border border-b">
          <SheetTitle>
            {t('bookmarks.title')}
            {bookmarkedTrialRefs.length > 0 && (
              <span className="text-muted-foreground ml-1.5 font-mono text-sm">
                {bookmarkedTrialRefs.length}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>{t('bookmarks.description')}</SheetDescription>
        </SheetHeader>

        {bookmarkedTrialRefs.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <Bookmark className="size-6" />
            <p className="text-sm">{t('bookmarks.emptyTitle')}</p>
            <p className="text-caption max-w-xs">{t('bookmarks.emptyHint')}</p>
          </div>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            <ItemGroup className="divide-border gap-0 divide-y">
              {bookmarkedTrialRefs.map((trialRef, index) => (
                <BookmarkRow
                  key={trialRef}
                  trialRef={trialRef}
                  trial={rowTrials.find((trial) => trial.trialRef === trialRef) ?? null}
                  isLoading={results[index]?.isPending}
                  isExporting={isExporting}
                  onSelect={handleSelect}
                  onRemove={removeBookmark}
                  onExport={(trial) => exportTrials([english(trial)])}
                />
              ))}
            </ItemGroup>
          </ScrollArea>
        )}

        <SheetFooter className="border-border border-t">
          <Button
            variant="secondary"
            disabled={loadedTrials.length === 0 || isExporting}
            onClick={() => exportTrials(loadedTrials)}
          >
            <FileDown />
            {t('bookmarks.exportAll')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export default BookmarksSheet;
