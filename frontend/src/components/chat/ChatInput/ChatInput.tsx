import type { ChatStatus } from 'ai';
import { useTranslation } from 'react-i18next';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';
import AskAiHint from '@/components/chat/AskAiHint/AskAiHint';
import SelectedTrials from '@/components/chat/SelectedTrials/SelectedTrials';
import type { Trial } from '@/types/trial';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  status?: ChatStatus;
  contextTrials?: Trial[];
  onRemoveContext?: (nctNumber: string) => void;
}

function ChatInput({
  onSend,
  onStop,
  status = 'ready',
  contextTrials = [],
  onRemoveContext,
}: ChatInputProps) {
  const { t } = useTranslation();

  const handleSubmit = (message: PromptInputMessage) => {
    if (status === 'streaming') {
      onStop?.();
      return;
    }
    const text = message.text.trim();
    if (!text) {
      return;
    }
    onSend(text);
  };

  return (
    <PromptInput
      onSubmit={handleSubmit}
      data-tour="chat-input"
      className="bg-background relative rounded-lg shadow-sm"
    >
      <div className="absolute top-2 right-2 z-10">
        <AskAiHint />
      </div>
      {contextTrials.length > 0 && (
        <PromptInputHeader>
          <SelectedTrials trials={contextTrials} onRemove={onRemoveContext} />
        </PromptInputHeader>
      )}
      <PromptInputBody>
        <PromptInputTextarea placeholder={t('chat.placeholder')} className="min-h-14" />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <span className="text-caption text-muted-foreground px-1">{t('chat.sendHint')}</span>
        </PromptInputTools>
        <PromptInputSubmit status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}

export default ChatInput;
