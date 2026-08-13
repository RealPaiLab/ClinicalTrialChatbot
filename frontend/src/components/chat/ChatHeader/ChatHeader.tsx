import { SquarePen, Stethoscope } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onNewConversation?: () => void;
}

function ChatHeader({ onNewConversation }: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="border-border flex items-center justify-between gap-2.5 border-b px-4 py-2">
      <div className="flex items-center gap-2.5">
        <div className="bg-primary/10 text-primary flex size-7 shrink-0 items-center justify-center rounded-md">
          <Stethoscope className="size-4" />
        </div>
        <span className="font-display text-sm leading-tight font-semibold">
          {t('app.shortTitle')}
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('chat.newConversation')}
        title={t('chat.newConversation')}
        onClick={onNewConversation}
      >
        <SquarePen />
      </Button>
    </header>
  );
}

export default ChatHeader;
