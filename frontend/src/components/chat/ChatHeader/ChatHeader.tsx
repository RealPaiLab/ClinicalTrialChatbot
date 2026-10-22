import { SquarePen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onNewConversation?: () => void;
}

function ChatHeader({ onNewConversation }: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="border-border flex items-center justify-end border-b px-2 py-1">
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
