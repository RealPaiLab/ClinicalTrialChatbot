import { useRef } from 'react';
import { MessagesSquare } from 'lucide-react';
import type { Components } from 'streamdown';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import AskAiSelection from '@/components/chat/AskAiSelection/AskAiSelection';
import MessageFeedback from '@/components/chat/MessageFeedback/MessageFeedback';
import SearchingIndicator from '@/components/chat/SearchingIndicator/SearchingIndicator';
import TermDefinition from '@/components/chat/TermDefinition/TermDefinition';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';
import { ChatRole, CITATION_HREF_PREFIX, DEFINITION_HREF_PREFIX } from '@/constants/chat';
import { linkifyCitations, linkifyDefinitions } from '@/lib/citations';
import type { ChatMessage, TrialSummary } from '@/types/trial';

const EMPTY_TITLE = 'How can I help?';
const EMPTY_DESCRIPTION =
  "Tell me about the cancer type, stage, and where you live, and I'll look for matching trials.";

type FetchTrial = (nctNumber: string, signal?: AbortSignal) => Promise<TrialSummary>;

interface ChatMessagesProps {
  messages: ChatMessage[];
  sessionId: string;
  fetchTrial: FetchTrial;
  onCitationClick?: (nctNumber: string) => void;
  onAskAi?: (text: string) => void;
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
      if (href?.startsWith(DEFINITION_HREF_PREFIX)) {
        const definition = decodeURIComponent(href.slice(DEFINITION_HREF_PREFIX.length));
        return <TermDefinition term={children} definition={definition} />;
      }
      return (
        <a href={href} rel="noreferrer" target="_blank">
          {children}
        </a>
      );
    },
  };
}

function ChatMessages({
  messages,
  sessionId,
  fetchTrial,
  onCitationClick,
  onAskAi,
}: ChatMessagesProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} className="contents">
      {onAskAi && <AskAiSelection rootRef={rootRef} onAsk={onAskAi} />}
      <Conversation data-tour="chat-messages" className="min-h-0 flex-1">
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
                  {message.role !== ChatRole.Assistant ? (
                    message.content
                  ) : message.content === '' ? (
                    <SearchingIndicator />
                  ) : message.isError ? (
                    <span className="text-destructive">{message.content}</span>
                  ) : (
                    <MessageResponse
                      components={createMarkdownComponents(fetchTrial, onCitationClick)}
                    >
                      {linkifyDefinitions(linkifyCitations(message.content))}
                    </MessageResponse>
                  )}
                </MessageContent>
                {message.role === ChatRole.Assistant && message.observationId && (
                  <MessageFeedback sessionId={sessionId} observationId={message.observationId} />
                )}
              </Message>
            ))
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
    </div>
  );
}

export default ChatMessages;
