import { SquarePen, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TITLE = 'Trial Navigator';
const TAGLINE = 'Cancer clinical trials, in plain language';
const NEW_CONVERSATION_LABEL = 'New conversation';

interface ChatHeaderProps {
  onNewConversation?: () => void;
}

function ChatHeader({ onNewConversation }: ChatHeaderProps) {
  return (
    <header className="border-border flex items-center justify-between gap-3 border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Stethoscope className="size-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-display text-base leading-tight font-semibold">{TITLE}</span>
          <span className="text-caption text-muted-foreground">{TAGLINE}</span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label={NEW_CONVERSATION_LABEL}
        title={NEW_CONVERSATION_LABEL}
        onClick={onNewConversation}
      >
        <SquarePen />
      </Button>
    </header>
  );
}

export default ChatHeader;
