import { MessagesSquare } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { ChatRole } from '@/constants/chat';
import type { ChatMessage } from '@/types/trial';

const EMPTY_TITLE = 'How can I help?';
const EMPTY_DESCRIPTION =
  "Tell me about the cancer type, stage, and where you live, and I'll look for matching trials.";

interface ChatMessagesProps {
  messages: ChatMessage[];
}

function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <Conversation className="min-h-0 flex-1">
      <ConversationContent>
        {messages.length === 0 ? (
          <ConversationEmptyState
            icon={<MessagesSquare className="size-6" />}
            title={EMPTY_TITLE}
            description={EMPTY_DESCRIPTION}
          />
        ) : (
          messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.role === ChatRole.Assistant ? (
                  <MessageResponse>{message.content}</MessageResponse>
                ) : (
                  message.content
                )}
              </MessageContent>
            </Message>
          ))
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}

export default ChatMessages;
