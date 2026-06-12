import { useMemo } from 'react';
import ChatHeader from '@/components/chat/ChatHeader/ChatHeader';
import ChatInput from '@/components/chat/ChatInput/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages/ChatMessages';
import FollowUpChips from '@/components/chat/FollowUpChips/FollowUpChips';
import SelectedTrials from '@/components/chat/SelectedTrials/SelectedTrials';
import { ChatRole } from '@/constants/chat';
import { useChat } from '@/hooks/useChat';
import { getTrialSummary } from '@/services/trials';
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
  const { messages, status, sendMessage, stop, reset } = useChat({ createStream, onTrialsChange });

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

  const suggestions = useMemo(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === ChatRole.Assistant);
    return lastAssistant?.followUpQuestions ?? [];
  }, [messages]);

  return (
    <div className="bg-background/80 flex h-full flex-col">
      <ChatHeader onNewConversation={handleNewConversation} />
      <ChatMessages messages={messages} fetchTrial={fetchTrial} onCitationClick={onCitationClick} />
      <div className="border-border flex flex-col gap-3 border-t p-3">
        <SelectedTrials trials={contextTrials} onRemove={onRemoveContext} />
        <FollowUpChips questions={suggestions} onSelect={handleSend} />
        <ChatInput onSend={handleSend} onStop={stop} status={status} />
      </div>
    </div>
  );
}

export default ChatPanel;
