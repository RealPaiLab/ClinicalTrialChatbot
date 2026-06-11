import { MessagesSquare } from 'lucide-react';
import type { Components } from 'streamdown';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';
import { ChatRole, CITATION_HREF_PREFIX } from '@/constants/chat';
import { linkifyCitations } from '@/lib/citations';
import type { ChatMessage, TrialSummary } from '@/types/trial';

const EMPTY_TITLE = 'How can I help?';
const EMPTY_DESCRIPTION =
  "Tell me about the cancer type, stage, and where you live, and I'll look for matching trials.";

type FetchTrial = (nctNumber: string, signal?: AbortSignal) => Promise<TrialSummary>;

interface ChatMessagesProps {
  messages: ChatMessage[];
  fetchTrial: FetchTrial;
  onCitationClick?: (nctNumber: string) => void;
}

function createMarkdownComponents(
  fetchTrial: FetchTrial,
  onCitationClick?: (nctNumber: string) => void
): Components {
  return {
    a: ({ href, children }) => {
      if (href?.startsWith(CITATION_HREF_PREFIX)) {
        const nctNumber = href.slice(CITATION_HREF_PREFIX.length);
        return (
          <TrialCitation nctNumber={nctNumber} fetchTrial={fetchTrial} onSelect={onCitationClick} />
        );
      }
      return (
        <a href={href} rel="noreferrer" target="_blank">
          {children}
        </a>
      );
    },
  };
}

function ChatMessages({ messages, fetchTrial, onCitationClick }: ChatMessagesProps) {
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
                  <MessageResponse
                    components={createMarkdownComponents(fetchTrial, onCitationClick)}
                  >
                    {linkifyCitations(message.content)}
                  </MessageResponse>
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
