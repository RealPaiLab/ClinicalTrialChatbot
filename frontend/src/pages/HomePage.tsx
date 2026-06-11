import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

function PanelPlaceholder({ label, name }: { label: string; name: string }) {
  return (
    <div className="h-full p-3">
      <div className="border-border/70 bg-card/40 flex h-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center">
        <span className="text-eyebrow text-primary">{label}</span>
        <span className="text-title text-muted-foreground">{name}</span>
      </div>
    </div>
  );
}

function HomePage() {
  const [dark, setDark] = useState(false);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  return (
    <div className="bg-background text-foreground flex h-screen w-screen flex-col overflow-hidden">
      <header className="border-border flex h-12 shrink-0 items-center justify-between border-b px-4">
        <span className="text-eyebrow text-primary">Clinical Trial Navigator</span>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
          {dark ? <Sun /> : <Moon />}
        </Button>
      </header>

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize="32%" minSize="22%" maxSize="46%">
          <PanelPlaceholder label="Conversation" name="Chat panel" />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize="68%">
          <ResizablePanelGroup orientation="vertical">
            <ResizablePanel defaultSize="66%">
              <PanelPlaceholder label="Trial map" name="Map panel" />
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize="34%" minSize="20%">
              <PanelPlaceholder label="Details" name="Trial summary" />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default HomePage;
