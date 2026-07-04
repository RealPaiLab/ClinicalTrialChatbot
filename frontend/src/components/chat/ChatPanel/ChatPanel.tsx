import { useMemo } from 'react';
import ChatDisclaimer from '@/components/chat/ChatDisclaimer/ChatDisclaimer';
import ChatHeader from '@/components/chat/ChatHeader/ChatHeader';
import ChatInput from '@/components/chat/ChatInput/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages/ChatMessages';
import FollowUpChips from '@/components/chat/FollowUpChips/FollowUpChips';
import { ASK_AI_PROMPT_PREFIX, ASK_AI_PROMPT_SUFFIX, ChatRole } from '@/constants/chat';
import { useChat } from '@/hooks/useChat';
import { getTrialSummary } from '@/services/trials';
import { useAppStore } from '@/store/appStore';
import type { StreamEvent, Trial, TrialSummary } from '@/types/trial';

interface ChatPanelProps {
  onTrialsChange?: (trials: Trial[]) => void;
  onCitationClick?: (nctNumber: string) => void;
  onReset?: () => void;
  contextTrials?: Trial[];
  onRemoveContext?: (nctNumber: string) => void;
  onClearContext?: () => void;
  createStream?: (text: string, signal?: AbortSignal) => AsyncGenerator<StreamEvent>;
  fetchTrial?: (nctNumber: string, signal?: AbortSignal) => Promise<TrialSummary>;
}

function ChatPanel({
  onTrialsChange,
  onCitationClick,
  onReset,
  contextTrials = [],
  onRemoveContext,
  onClearContext,
  createStream,
  fetchTrial = getTrialSummary,
}: ChatPanelProps) {
  const { messages, status, sessionId, sendMessage, stop, reset } = useChat({
    createStream,
    onTrialsChange,
  });

  const tourMessages = useAppStore((state) => state.tourMessages);
  const displayMessages = tourMessages.length > 0 ? tourMessages : messages;

  const handleSend = (text: string) => {
    const contextNctNumbers = contextTrials
      .map((trial) => trial.nctNumber)
      .filter((nct): nct is string => Boolean(nct));
    void sendMessage(text, contextNctNumbers);
    onClearContext?.();
  };

  const handleNewConversation = () => {
    reset();
    onReset?.();
  };

  const handleAskAi = (text: string) => {
    void sendMessage(`${ASK_AI_PROMPT_PREFIX}"${text}"${ASK_AI_PROMPT_SUFFIX}`);
  };

  const suggestions = useMemo(() => {
    const lastAssistant = [...displayMessages]
      .reverse()
      .find((message) => message.role === ChatRole.Assistant);
    return lastAssistant?.followUpQuestions ?? [];
  }, [displayMessages]);

  return (
    <div className="bg-card flex h-full flex-col">
      <ChatHeader onNewConversation={handleNewConversation} />
      <ChatMessages
        messages={displayMessages}
        sessionId={sessionId}
        fetchTrial={fetchTrial}
        onCitationClick={onCitationClick}
        onAskAi={handleAskAi}
      />
      <div className="border-border bg-secondary/60 before:bg-amber/80 relative flex flex-col gap-3 border-t p-2 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:content-['']">
        <FollowUpChips questions={suggestions} onSelect={handleSend} />
        <ChatInput
          onSend={handleSend}
          onStop={stop}
          status={status}
          contextTrials={contextTrials}
          onRemoveContext={onRemoveContext}
        />
        <ChatDisclaimer />
      </div>
    </div>
  );
}

export default ChatPanel;
