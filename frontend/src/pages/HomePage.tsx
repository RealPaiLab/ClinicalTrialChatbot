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

const TOUR_SETTLE_MS = 600;
const LANGUAGE_GATE_EXIT_MS = 160;

function HomePage() {
  const trials = useAppStore((state) => state.trials);
  const selectedTrialRef = useAppStore((state) => state.selectedTrialRef);
  const selectedSiteKey = useAppStore((state) => state.selectedSiteKey);
  const contextTrialRefs = useAppStore((state) => state.contextTrialRefs);
  const bookmarkedTrialRefs = useAppStore((state) => state.bookmarkedTrialRefs);
  const theme = useAppStore((state) => state.theme);
  const hasChosenLanguage = useAppStore((state) => state.hasChosenLanguage);
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
  const hasSelection = Boolean(selectedTrialRef);
  const summaryPanelRef = usePanelRef();
  const splitGroupRef = useRef<HTMLDivElement | null>(null);

  const { startTour } = useOnboardingTour();
  const languageChosenOnLoad = useRef(hasChosenLanguage);

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
    if (!hasChosenLanguage) return;
    if (useAppStore.getState().hasSeenTour) return;

    if (languageChosenOnLoad.current) {
      const timer = window.setTimeout(() => startTour(), TOUR_SETTLE_MS);
      return () => window.clearTimeout(timer);
    }
    startTour({ driveDelayMs: LANGUAGE_GATE_EXIT_MS });
  }, [hasChosenLanguage, startTour]);

  // A bookmark can outlive the conversation that surfaced it, so opening one
  // puts the trial back on the map before selecting it.
  const handleOpenBookmark = (trial: Trial) => {
    const trialRef = trial.trialRef;
    if (!trialRef) return;
    addBookmarkTrial(trial);
    selectTrial(trialRef);
    addToContext(trialRef);
  };

  // Dropping a bookmark-opened trial from the chat context takes its pin with
  // it: nothing in the conversation put it there, so nothing should keep it.
  const handleRemoveContext = (trialRef: string) => {
    removeFromContext(trialRef);
    dropBookmarkTrial(trialRef);
  };

  // Pins and context chips read a translation only if one already exists; the
  // summary panel is the single surface that commissions one.
  const labelledTrials = useCachedTrialTranslations(trials);
  const selectedTrial = trials.find((trial) => trial.trialRef === selectedTrialRef) ?? null;
  const contextTrials = contextTrialRefs
    .map((nct) => labelledTrials.find((trial) => trial.trialRef === nct))
    .filter((trial): trial is Trial => Boolean(trial));
  const selectedInContext = selectedTrialRef ? contextTrialRefs.includes(selectedTrialRef) : false;
  const selectedIsBookmarked = selectedTrialRef
    ? bookmarkedTrialRefs.includes(selectedTrialRef)
    : false;

  return (
    <div
      data-tour="app"
      className="text-foreground flex h-screen w-screen flex-col overflow-hidden"
    >
      <AppHeader
        dark={dark}
        bookmarkCount={bookmarkedTrialRefs.length}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        onStartTour={() => startTour()}
        onToggleTheme={toggleTheme}
      />

      <BookmarksSheet
        open={bookmarksOpen}
        onOpenChange={setBookmarksOpen}
        bookmarkedTrialRefs={bookmarkedTrialRefs}
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
                    selectedTrialRef={selectedTrialRef}
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
