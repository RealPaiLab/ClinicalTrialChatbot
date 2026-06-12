import { useMemo } from 'react';
import ChatHeader from '@/components/chat/ChatHeader/ChatHeader';
import ChatInput from '@/components/chat/ChatInput/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages/ChatMessages';
import FollowUpChips from '@/components/chat/FollowUpChips/FollowUpChips';
import { ChatRole } from '@/constants/chat';
import { useChat } from '@/hooks/useChat';
import { getTrialSummary } from '@/services/trials';
import type { StreamEvent, Trial, TrialSummary } from '@/types/trial';

interface ChatPanelProps {
  onTrialsChange?: (trials: Trial[]) => void;
  onCitationClick?: (nctNumber: string) => void;
  onReset?: () => void;
  createStream?: (text: string, signal?: AbortSignal) => AsyncGenerator<StreamEvent>;
  fetchTrial?: (nctNumber: string, signal?: AbortSignal) => Promise<TrialSummary>;
}

function ChatPanel({
  onTrialsChange,
  onCitationClick,
  onReset,
  createStream,
  fetchTrial = getTrialSummary,
}: ChatPanelProps) {
  const { messages, status, sendMessage, stop, reset } = useChat({ createStream, onTrialsChange });

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
        <FollowUpChips questions={suggestions} onSelect={sendMessage} />
        <ChatInput onSend={sendMessage} onStop={stop} status={status} />
      </div>
    </div>
  );
}

export default ChatPanel;
