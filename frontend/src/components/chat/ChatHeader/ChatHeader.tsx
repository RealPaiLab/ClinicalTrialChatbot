import { Stethoscope } from 'lucide-react';

const TITLE = 'Trial Navigator';
const TAGLINE = 'Cancer clinical trials, in plain language';

function ChatHeader() {
  return (
    <header className="border-border flex items-center gap-3 border-b px-4 py-3">
      <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
        <Stethoscope className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-display text-base leading-tight font-semibold">{TITLE}</span>
        <span className="text-caption text-muted-foreground">{TAGLINE}</span>
      </div>
    </header>
  );
}

export default ChatHeader;
