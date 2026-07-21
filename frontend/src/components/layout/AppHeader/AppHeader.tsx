import { HelpCircle, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TITLE = 'Cancer Clinical Trial Navigator';

interface AppHeaderProps {
  dark: boolean;
  onStartTour: () => void;
  onToggleTheme: () => void;
}

function AppHeader({ dark, onStartTour, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="bg-header text-header-foreground border-border after:bg-amber relative flex h-12 shrink-0 items-center justify-between border-b px-4 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:content-['']">
      <div className="flex items-center gap-2.5">
        <span className="text-eyebrow">{TITLE}</span>
        <span className="text-eyebrow text-primary bg-primary/10 rounded-full px-2 py-0.5 font-bold">
          Pre-Release Version
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onStartTour} aria-label="Take a tour">
          <HelpCircle />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          aria-label={dark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        >
          {dark ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}

export default AppHeader;
