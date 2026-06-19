import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatPanel from '@/components/chat/ChatPanel/ChatPanel';
import MapPanel from '@/components/map/MapPanel/MapPanel';
import TrialSummaryPanel from '@/components/summary/TrialSummaryPanel/TrialSummaryPanel';
import type { Trial } from '@/types/trial';

function HomePage() {
  const [dark, setDark] = useState(false);
  const [trials, setTrials] = useState<Trial[]>([]);
  const [selectedNctNumber, setSelectedNctNumber] = useState<string | null>(null);
  const [contextNctNumbers, setContextNctNumbers] = useState<string[]>([]);

  const selectedTrial = trials.find((trial) => trial.nctNumber === selectedNctNumber) ?? null;
  const contextTrials = contextNctNumbers
    .map((nct) => trials.find((trial) => trial.nctNumber === nct))
    .filter((trial): trial is Trial => Boolean(trial));

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const handleSelectTrial = (nctNumber: string) => {
    setSelectedNctNumber(nctNumber);
    setContextNctNumbers((prev) => (prev.includes(nctNumber) ? prev : [...prev, nctNumber]));
  };

  const removeFromContext = (nctNumber: string) => {
    setContextNctNumbers((prev) => prev.filter((nct) => nct !== nctNumber));
  };

  const handleReset = () => {
    setTrials([]);
    setSelectedNctNumber(null);
    setContextNctNumbers([]);
  };

  return (
    <div className="text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <header className="bg-header text-header-foreground border-border after:bg-amber relative flex h-12 shrink-0 items-center justify-between border-b px-4 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:content-['']">
        <span className="text-eyebrow">Clinical Trial Navigator</span>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun /> : <Moon />}
        </Button>
      </header>

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="32%" minSize="22%" maxSize="46%">
          <ChatPanel
            onTrialsChange={setTrials}
            onCitationClick={handleSelectTrial}
            onReset={handleReset}
            contextTrials={contextTrials}
            onRemoveContext={removeFromContext}
            onClearContext={() => setContextNctNumbers([])}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="68%" className="bg-secondary/60">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="66%">
              <div className="h-full p-2 pb-1">
                <div className="border-border h-full overflow-hidden rounded-lg border shadow-sm">
                  <MapPanel
                    trials={trials}
                    selectedNctNumber={selectedNctNumber}
                    onSelectTrial={handleSelectTrial}
                    dark={dark}
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle className="bg-transparent" />

            <ResizablePanel defaultSize="34%" minSize="20%">
              <div className="h-full p-2 pt-1">
                <div className="border-border h-full overflow-hidden rounded-lg border shadow-sm">
                  <TrialSummaryPanel
                    trial={selectedTrial}
                    onClose={() => setSelectedNctNumber(null)}
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
