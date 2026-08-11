import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePanelRef } from 'react-resizable-panels';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatPanel from '@/components/chat/ChatPanel/ChatPanel';
import MapPanel from '@/components/map/MapPanel/MapPanel';
import TrialSummaryPanel from '@/components/summary/TrialSummaryPanel/TrialSummaryPanel';
import AppHeader from '@/components/layout/AppHeader/AppHeader';
import AppFooter from '@/components/layout/AppFooter/AppFooter';
import BookmarksSheet from '@/components/bookmarks/BookmarksSheet/BookmarksSheet';
import { useOnboardingTour } from '@/components/onboarding/tour/useOnboardingTour';
import { useCachedTrialTranslations } from '@/hooks/useCachedTranslation';
import { useTrialPdfExport } from '@/hooks/useTrialPdfExport';
import { useAppStore } from '@/store/appStore';
import { PANEL_SPLIT } from '@/constants/layout';
import type { Trial } from '@/types/trial';

function HomePage() {
  const trials = useAppStore((state) => state.trials);
  const selectedNctNumber = useAppStore((state) => state.selectedNctNumber);
  const selectedSiteKey = useAppStore((state) => state.selectedSiteKey);
  const contextNctNumbers = useAppStore((state) => state.contextNctNumbers);
  const bookmarkedNctNumbers = useAppStore((state) => state.bookmarkedNctNumbers);
  const theme = useAppStore((state) => state.theme);
  const setTrials = useAppStore((state) => state.setTrials);
  const selectTrial = useAppStore((state) => state.selectTrial);
  const addToContext = useAppStore((state) => state.addToContext);
  const removeFromContext = useAppStore((state) => state.removeFromContext);
  const clearContext = useAppStore((state) => state.clearContext);
  const toggleBookmark = useAppStore((state) => state.toggleBookmark);
  const removeBookmark = useAppStore((state) => state.removeBookmark);
  const addBookmarkTrial = useAppStore((state) => state.addBookmarkTrial);
  const dropBookmarkTrial = useAppStore((state) => state.dropBookmarkTrial);
  const reset = useAppStore((state) => state.reset);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const { exportTrials, isExporting } = useTrialPdfExport();

  const dark = theme === 'dark';
  const hasSelection = Boolean(selectedNctNumber);
  const summaryPanelRef = usePanelRef();
  const splitGroupRef = useRef<HTMLDivElement | null>(null);

  const { startTour } = useOnboardingTour();

  useEffect(() => {
    const group = splitGroupRef.current;
    group?.classList.add(PANEL_SPLIT.animatingClass);
    summaryPanelRef.current?.resize(
      hasSelection ? PANEL_SPLIT.summaryFocused : PANEL_SPLIT.summaryIdle
    );

    const timer = window.setTimeout(
      () => group?.classList.remove(PANEL_SPLIT.animatingClass),
      PANEL_SPLIT.animationMs
    );
    return () => window.clearTimeout(timer);
  }, [hasSelection, summaryPanelRef]);

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    if (!useAppStore.getState().hasSeenTour) {
      const timer = window.setTimeout(startTour, 600);
      return () => window.clearTimeout(timer);
    }
  }, [startTour]);

  // A bookmark can outlive the conversation that surfaced it, so opening one
  // puts the trial back on the map before selecting it.
  const handleOpenBookmark = (trial: Trial) => {
    const nctNumber = trial.nctNumber;
    if (!nctNumber) return;
    addBookmarkTrial(trial);
    selectTrial(nctNumber);
    addToContext(nctNumber);
  };

  // Dropping a bookmark-opened trial from the chat context takes its pin with
  // it: nothing in the conversation put it there, so nothing should keep it.
  const handleRemoveContext = (nctNumber: string) => {
    removeFromContext(nctNumber);
    dropBookmarkTrial(nctNumber);
  };

  // Pins and context chips read a translation only if one already exists; the
  // summary panel is the single surface that commissions one.
  const labelledTrials = useCachedTrialTranslations(trials);
  const selectedTrial = trials.find((trial) => trial.nctNumber === selectedNctNumber) ?? null;
  const contextTrials = contextNctNumbers
    .map((nct) => labelledTrials.find((trial) => trial.nctNumber === nct))
    .filter((trial): trial is Trial => Boolean(trial));
  const selectedInContext = selectedNctNumber
    ? contextNctNumbers.includes(selectedNctNumber)
    : false;
  const selectedIsBookmarked = selectedNctNumber
    ? bookmarkedNctNumbers.includes(selectedNctNumber)
    : false;

  return (
    <div
      data-tour="app"
      className="text-foreground flex h-screen w-screen flex-col overflow-hidden"
    >
      <AppHeader
        dark={dark}
        bookmarkCount={bookmarkedNctNumbers.length}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        onStartTour={startTour}
        onToggleTheme={toggleTheme}
      />

      <BookmarksSheet
        open={bookmarksOpen}
        onOpenChange={setBookmarksOpen}
        bookmarkedNctNumbers={bookmarkedNctNumbers}
        onRemove={removeBookmark}
        onSelect={handleOpenBookmark}
        onExport={exportTrials}
        isExporting={isExporting}
      />

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="37%" minSize="22%" maxSize="50%">
          <ChatPanel
            onTrialsChange={setTrials}
            onCitationClick={selectTrial}
            onReset={reset}
            contextTrials={contextTrials}
            onRemoveContext={handleRemoveContext}
            onClearContext={clearContext}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="63%" className="bg-canvas">
          <ResizablePanelGroup orientation="vertical" elementRef={splitGroupRef}>
            <ResizablePanel minSize="20%">
              <div className="h-full p-2 pb-1">
                <div
                  data-tour="map"
                  className="border-border h-full overflow-hidden rounded-lg border shadow-sm"
                >
                  <MapPanel
                    trials={labelledTrials}
                    selectedNctNumber={selectedNctNumber}
                    selectedSiteKey={selectedSiteKey}
                    onSelectTrial={selectTrial}
                    dark={dark}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            <ResizablePanel
              panelRef={summaryPanelRef}
              defaultSize={hasSelection ? PANEL_SPLIT.summaryFocused : PANEL_SPLIT.summaryIdle}
              minSize="20%"
              maxSize="80%"
            >
              <div className="h-full p-2 pt-1">
                <div
                  data-tour="summary"
                  className="border-border h-full overflow-hidden rounded-lg border shadow-sm"
                >
                  <TrialSummaryPanel
                    trial={selectedTrial}
                    onClose={() => selectTrial(null)}
                    onAddToContext={addToContext}
                    isInContext={selectedInContext}
                    onToggleBookmark={toggleBookmark}
                    isBookmarked={selectedIsBookmarked}
                  />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>

      <AppFooter />
    </div>
  );
}

export default HomePage;
