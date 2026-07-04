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
import AskAiHint from '@/components/chat/AskAiHint/AskAiHint';

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
    <PromptInput onSubmit={handleSubmit} className="bg-background relative rounded-lg shadow-sm">
      <div className="absolute top-2 right-2 z-10">
        <AskAiHint />
      </div>
      <PromptInputBody>
        <PromptInputTextarea placeholder={PLACEHOLDER} className="min-h-14" />
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
