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
import { useCachedTrialTranslations } from '@/hooks/useCachedTranslation';
import { getTrial } from '@/services/trials';
import type { Trial } from '@/types/trial';

interface BookmarksSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookmarkedNctNumbers: string[];
  onRemove: (nctNumber: string) => void;
  onSelect?: (trial: Trial) => void;
  onExport: (trials: Trial[]) => void;
  isExporting?: boolean;
  fetchTrial?: (nctNumber: string, signal?: AbortSignal) => Promise<Trial>;
}

function BookmarksSheet({
  open,
  onOpenChange,
  bookmarkedNctNumbers,
  onRemove,
  onSelect,
  onExport,
  isExporting,
  fetchTrial = getTrial,
}: BookmarksSheetProps) {
  const { t } = useTranslation();
  const results = useQueries({
    queries: bookmarkedNctNumbers.map((nctNumber) => ({
      queryKey: ['trial', nctNumber],
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchTrial(nctNumber, signal),
      enabled: open,
    })),
  });

  const loadedTrials = results
    .map((result) => result.data)
    .filter((trial): trial is Trial => Boolean(trial));
  const rowTrials = useCachedTrialTranslations(loadedTrials);

  // Rows hand back the trial they render, which may be the translated copy;
  // opening and exporting must both work from the stored English one.
  const english = (trial: Trial) =>
    loadedTrials.find((loaded) => loaded.nctNumber === trial.nctNumber) ?? trial;

  const handleSelect = (trial: Trial) => {
    onSelect?.(english(trial));
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
            {bookmarkedNctNumbers.length > 0 && (
              <span className="text-muted-foreground ml-1.5 font-mono text-sm">
                {bookmarkedNctNumbers.length}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>{t('bookmarks.description')}</SheetDescription>
        </SheetHeader>

        {bookmarkedNctNumbers.length === 0 ? (
          <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
            <Bookmark className="size-6" />
            <p className="text-sm">{t('bookmarks.emptyTitle')}</p>
            <p className="text-caption max-w-xs">{t('bookmarks.emptyHint')}</p>
          </div>
        ) : (
          <ScrollArea className="min-h-0 flex-1">
            <ItemGroup className="divide-border gap-0 divide-y">
              {bookmarkedNctNumbers.map((nctNumber, index) => (
                <BookmarkRow
                  key={nctNumber}
                  nctNumber={nctNumber}
                  trial={rowTrials.find((trial) => trial.nctNumber === nctNumber) ?? null}
                  isLoading={results[index]?.isPending}
                  isExporting={isExporting}
                  onSelect={handleSelect}
                  onRemove={onRemove}
                  onExport={(trial) => onExport([english(trial)])}
                />
              ))}
            </ItemGroup>
          </ScrollArea>
        )}

        <SheetFooter className="border-border border-t">
          <Button
            variant="secondary"
            disabled={loadedTrials.length === 0 || isExporting}
            onClick={() => onExport(loadedTrials)}
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
