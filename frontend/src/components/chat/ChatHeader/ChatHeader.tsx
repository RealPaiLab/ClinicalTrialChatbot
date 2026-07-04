import { SquarePen, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TITLE = 'Trial Navigator';
const NEW_CONVERSATION_LABEL = 'New conversation';

interface ChatHeaderProps {
  onNewConversation?: () => void;
}

function ChatHeader({ onNewConversation }: ChatHeaderProps) {
  return (
    <header className="border-border flex items-center justify-between gap-2.5 border-b px-4 py-2">
      <div className="flex items-center gap-2.5">
        <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
          <Stethoscope className="size-4" />
        </div>
        <span className="font-display text-sm leading-tight font-semibold">{TITLE}</span>
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
