import type { ChatStatus } from 'ai';
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  type PromptInputMessage,
} from '@/components/ai-elements/prompt-input';

const PLACEHOLDER = 'Describe your situation or ask about a trial...';
const SEND_HINT = 'Enter to send';

interface ChatInputProps {
  onSend: (text: string) => void;
  onStop?: () => void;
  status?: ChatStatus;
}

function ChatInput({ onSend, onStop, status = 'ready' }: ChatInputProps) {
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
    <PromptInput onSubmit={handleSubmit}>
      <PromptInputBody>
        <PromptInputTextarea placeholder={PLACEHOLDER} />
      </PromptInputBody>
      <PromptInputFooter>
        <PromptInputTools>
          <span className="text-caption text-muted-foreground px-1">{SEND_HINT}</span>
        </PromptInputTools>
        <PromptInputSubmit status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}

export default ChatInput;
