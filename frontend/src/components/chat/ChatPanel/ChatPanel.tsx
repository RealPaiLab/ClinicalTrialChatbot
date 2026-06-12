import { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ChatStatus } from 'ai';
import ChatHeader from '@/components/chat/ChatHeader/ChatHeader';
import ChatInput from '@/components/chat/ChatInput/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages/ChatMessages';
import FollowUpChips from '@/components/chat/FollowUpChips/FollowUpChips';
import { ChatRole, StreamEventType } from '@/constants/chat';
import { streamMockChat } from '@/services/chat.mock';
import { getTrialSummaryMock } from '@/services/trials.mock';
import type { ChatMessage, StreamEvent, Trial, TrialSummary } from '@/types/trial';

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
  createStream = streamMockChat,
  fetchTrial = getTrialSummaryMock,
}: ChatPanelProps) {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>('ready');
  const abortRef = useRef<AbortController | null>(null);

  const patchMessage = (id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((message) => (message.id === id ? { ...message, ...patch } : message))
    );
  };

  const handleSend = async (text: string) => {
    if (status === 'streaming') return;

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: ChatRole.User, content: text },
      { id: assistantId, role: ChatRole.Assistant, content: '' },
    ]);
    setStatus('streaming');

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      for await (const event of createStream(text, controller.signal)) {
        if (event.type === StreamEventType.AgentResponse) {
          patchMessage(assistantId, { content: event.data.message });
        } else if (event.type === StreamEventType.ChatResult) {
          patchMessage(assistantId, {
            content: event.data.message,
            trials: event.data.trials,
            followUpQuestions: event.data.followUpQuestions,
          });
          for (const trial of event.data.trials) {
            if (trial.nctNumber) queryClient.setQueryData(['trial', trial.nctNumber], trial);
          }
          onTrialsChange?.(event.data.trials);
        } else {
          patchMessage(assistantId, { content: event.data });
        }
      }
    } finally {
      setStatus('ready');
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  const handleNewConversation = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    queryClient.removeQueries({ queryKey: ['trial'] });
    setMessages([]);
    setStatus('ready');
    onTrialsChange?.([]);
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
        <FollowUpChips questions={suggestions} onSelect={handleSend} />
        <ChatInput onSend={handleSend} onStop={handleStop} status={status} />
      </div>
    </div>
  );
}

export default ChatPanel;
