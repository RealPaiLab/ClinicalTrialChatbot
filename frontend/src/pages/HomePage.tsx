import { useEffect } from 'react';
import { HelpCircle, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatPanel from '@/components/chat/ChatPanel/ChatPanel';
import MapPanel from '@/components/map/MapPanel/MapPanel';
import TrialSummaryPanel from '@/components/summary/TrialSummaryPanel/TrialSummaryPanel';
import { useOnboardingTour } from '@/onboarding/useOnboardingTour';
import { useAppStore } from '@/store/appStore';
import type { Trial } from '@/types/trial';

function HomePage() {
  const trials = useAppStore((state) => state.trials);
  const selectedNctNumber = useAppStore((state) => state.selectedNctNumber);
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

  useEffect(() => {
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
      <header className="bg-header text-header-foreground border-border after:bg-amber relative flex h-12 shrink-0 items-center justify-between border-b px-4 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:content-['']">
        <span className="text-eyebrow">Clinical Trial Navigator</span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={startTour} aria-label="Take a tour">
            <HelpCircle />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to Light theme' : 'Switch to Dark theme'}
          >
            {dark ? <Sun /> : <Moon />}
          </Button>
        </div>
      </header>

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="32%" minSize="22%" maxSize="46%">
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

        <ResizablePanel defaultSize="68%" className="bg-canvas">
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
                    onSelectTrial={selectTrial}
                    dark={dark}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            <ResizablePanel defaultSize="34%" minSize="20%">
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
    </div>
  );
}

export default HomePage;
