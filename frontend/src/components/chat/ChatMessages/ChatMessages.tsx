import { useRef } from 'react';
import type { Components } from 'streamdown';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import AskAiSelection from '@/components/chat/AskAiSelection/AskAiSelection';
import MessageFeedback from '@/components/chat/MessageFeedback/MessageFeedback';
import SearchingIndicator from '@/components/chat/SearchingIndicator/SearchingIndicator';
import TermDefinition from '@/components/chat/TermDefinition/TermDefinition';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';
import {
  AGENT_NAME,
  ChatRole,
  CITATION_HREF_PREFIX,
  DEFINITION_HREF_PREFIX,
} from '@/constants/chat';
import { linkifyCitations, linkifyDefinitions } from '@/lib/citations';
import type { ChatMessage, TrialSummary } from '@/types/trial';

const STARTER_MESSAGE = `Hello, I'm ${AGENT_NAME}. I help people find cancer clinical trials in Ontario. How can I help you today?`;

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
            <Message from={ChatRole.Assistant}>
              <MessageContent>{STARTER_MESSAGE}</MessageContent>
            </Message>
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
