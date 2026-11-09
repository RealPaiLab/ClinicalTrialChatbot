import { useCallback, useMemo } from 'react';
import ChatDisclaimer from '@/components/chat/ChatDisclaimer/ChatDisclaimer';
import ChatHeader from '@/components/chat/ChatHeader/ChatHeader';
import ChatInput from '@/components/chat/ChatInput/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages/ChatMessages';
import FollowUpChips from '@/components/chat/FollowUpChips/FollowUpChips';
import { useTurnstile } from '@/components/turnstile/TurnstileContext';
import { ASK_AI_PROMPT_PREFIX, ASK_AI_PROMPT_SUFFIX, ChatRole } from '@/constants/chat';
import { useChat } from '@/hooks/useChat';
import { useContextTrials } from '@/hooks/useWorkspace';
import { useAppStore } from '@/store/appStore';

interface ChatPanelProps {
  onCitationClick: (trialRef: string) => void;
}

function ChatPanel({ onCitationClick }: ChatPanelProps) {
  const turnstile = useTurnstile();
  const getTurnstileToken = useCallback(() => turnstile.token, [turnstile.token]);
  const { messages, status, sessionId, sendMessage, stop, reset } = useChat({
    getTurnstileToken,
    verificationId: turnstile.verificationId,
  });

  const tourMessages = useAppStore((state) => state.tour?.messages);
  const removeFromContext = useAppStore((state) => state.removeFromContext);
  const contextTrials = useContextTrials();
  const displayMessages = tourMessages ?? messages;

  const handleSend = (text: string) => {
    void sendMessage(
      text,
      contextTrials.map((trial) => trial.trialRef)
    );
  };

  const handleAskAi = (text: string) => {
    void sendMessage(`${ASK_AI_PROMPT_PREFIX}"${text}"${ASK_AI_PROMPT_SUFFIX}`);
  };

  const suggestions = useMemo(() => {
    const lastAssistant = displayMessages.findLast(
      (message) => message.role === ChatRole.Assistant
    );
    return lastAssistant?.followUpQuestions ?? [];
  }, [displayMessages]);

  return (
    <div className="bg-card flex h-full flex-col">
      <ChatHeader onNewConversation={reset} />
      <ChatMessages
        messages={displayMessages}
        sessionId={sessionId}
        onCitationClick={onCitationClick}
        onAskAi={handleAskAi}
      />
      <div className="border-border bg-secondary/60 relative flex flex-col gap-3 border-t p-2">
        <FollowUpChips questions={suggestions} onSelect={handleSend} />
        <ChatInput
          onSend={handleSend}
          onStop={stop}
          status={status}
          contextTrials={contextTrials}
          onRemoveContext={removeFromContext}
        />
        <ChatDisclaimer />
      </div>
    </div>
  );
}

export default ChatPanel;
