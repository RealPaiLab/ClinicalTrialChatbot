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

  const selectedTrial = trials.find((trial) => trial.nctNumber === selectedNctNumber) ?? null;

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const handleReset = () => {
    setTrials([]);
    setSelectedNctNumber(null);
  };

  return (
    <div className="text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <header className="border-border bg-background/70 flex h-12 shrink-0 items-center justify-between border-b px-4 backdrop-blur-sm">
        <span className="text-eyebrow text-primary">Clinical Trial Navigator</span>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun /> : <Moon />}
        </Button>
      </header>

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="32%" minSize="22%" maxSize="46%">
          <ChatPanel
            onTrialsChange={setTrials}
            onCitationClick={setSelectedNctNumber}
            onReset={handleReset}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="68%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="66%">
              <MapPanel
                trials={trials}
                selectedNctNumber={selectedNctNumber}
                onSelectTrial={setSelectedNctNumber}
                dark={dark}
              />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize="34%" minSize="20%">
              <TrialSummaryPanel trial={selectedTrial} onClose={() => setSelectedNctNumber(null)} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default HomePage;
