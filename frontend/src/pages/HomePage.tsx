import { useEffect, useLayoutEffect } from 'react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatPanel from '@/components/chat/ChatPanel/ChatPanel';
import MapPanel from '@/components/map/MapPanel/MapPanel';
import TrialSummaryPanel from '@/components/summary/TrialSummaryPanel/TrialSummaryPanel';
import AppHeader from '@/components/layout/AppHeader/AppHeader';
import AppFooter from '@/components/layout/AppFooter/AppFooter';
import { useOnboardingTour } from '@/components/onboarding/tour/useOnboardingTour';
import { useAppStore } from '@/store/appStore';
import type { Trial } from '@/types/trial';

function HomePage() {
  const trials = useAppStore((state) => state.trials);
  const selectedNctNumber = useAppStore((state) => state.selectedNctNumber);
  const selectedSiteKey = useAppStore((state) => state.selectedSiteKey);
  const contextNctNumbers = useAppStore((state) => state.contextNctNumbers);
  const theme = useAppStore((state) => state.theme);
  const setTrials = useAppStore((state) => state.setTrials);
  const selectTrial = useAppStore((state) => state.selectTrial);
  const addToContext = useAppStore((state) => state.addToContext);
  const removeFromContext = useAppStore((state) => state.removeFromContext);
  const clearContext = useAppStore((state) => state.clearContext);
  const reset = useAppStore((state) => state.reset);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  const dark = theme === 'dark';

  const { startTour } = useOnboardingTour();

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    if (!useAppStore.getState().hasSeenTour) {
      const timer = window.setTimeout(startTour, 600);
      return () => window.clearTimeout(timer);
    }
  }, [startTour]);

  const selectedTrial = trials.find((trial) => trial.nctNumber === selectedNctNumber) ?? null;
  const contextTrials = contextNctNumbers
    .map((nct) => trials.find((trial) => trial.nctNumber === nct))
    .filter((trial): trial is Trial => Boolean(trial));
  const selectedInContext = selectedNctNumber
    ? contextNctNumbers.includes(selectedNctNumber)
    : false;

  return (
    <div
      data-tour="app"
      className="text-foreground flex h-screen w-screen flex-col overflow-hidden"
    >
      <AppHeader dark={dark} onStartTour={startTour} onToggleTheme={toggleTheme} />

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="37%" minSize="22%" maxSize="50%">
          <ChatPanel
            onTrialsChange={setTrials}
            onCitationClick={selectTrial}
            onReset={reset}
            contextTrials={contextTrials}
            onRemoveContext={removeFromContext}
            onClearContext={clearContext}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="63%" className="bg-canvas">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="66%">
              <div className="h-full p-2 pb-1">
                <div
                  data-tour="map"
                  className="border-border h-full overflow-hidden rounded-lg border shadow-sm"
                >
                  <MapPanel
                    trials={trials}
                    selectedNctNumber={selectedNctNumber}
                    selectedSiteKey={selectedSiteKey}
                    onSelectTrial={selectTrial}
                    dark={dark}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            <ResizablePanel defaultSize="34%" minSize="20%" maxSize="80%">
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
