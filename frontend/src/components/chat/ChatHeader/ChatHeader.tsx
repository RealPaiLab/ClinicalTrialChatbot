import { SquarePen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import ActionTooltip from '@/components/common/ActionTooltip/ActionTooltip';

interface ChatHeaderProps {
  onNewConversation: () => void;
}

function ChatHeader({ onNewConversation }: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="border-border flex items-center justify-end border-b px-2 py-1">
      <ActionTooltip label={t('chat.newConversation')}>
        <Button
          variant="action"
          size="icon"
          aria-label={t('chat.newConversation')}
          onClick={onNewConversation}
        >
          <SquarePen />
        </Button>
      </ActionTooltip>
    </header>
  );
}

export default ChatHeader;
