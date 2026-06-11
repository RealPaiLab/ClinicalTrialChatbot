import { useMemo, useState } from 'react';
import ChatHeader from '@/components/chat/ChatHeader/ChatHeader';
import ChatInput from '@/components/chat/ChatInput/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages/ChatMessages';
import FollowUpChips from '@/components/chat/FollowUpChips/FollowUpChips';
import { ChatRole } from '@/constants/chat';
import type { ChatMessage, Trial } from '@/types/trial';
import { mockConversation } from '@/test/fixtures/trials';

const FALLBACK_REPLY = 'Here is what I found.';

interface ChatPanelProps {
  onTrialsChange?: (trials: Trial[]) => void;
  onCitationClick?: (nctNumber: string) => void;
}

function ChatPanel({ onTrialsChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const cannedReply = mockConversation.find((message) => message.role === ChatRole.Assistant);

  const handleSend = (text: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: ChatRole.User,
      content: text,
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: ChatRole.Assistant,
      content: cannedReply?.content ?? FALLBACK_REPLY,
      trials: cannedReply?.trials,
      followUpQuestions: cannedReply?.followUpQuestions,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    if (assistantMessage.trials) {
      onTrialsChange?.(assistantMessage.trials);
    }
  };

  const suggestions = useMemo(() => {
    const lastAssistant = [...messages]
      .reverse()
      .find((message) => message.role === ChatRole.Assistant);
    return lastAssistant?.followUpQuestions ?? [];
  }, [messages]);

  return (
    <div className="bg-background flex h-full flex-col">
      <ChatHeader />
      <ChatMessages messages={messages} />
      <div className="border-border flex flex-col gap-3 border-t p-3">
        <FollowUpChips questions={suggestions} onSelect={handleSend} />
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}

export default ChatPanel;
