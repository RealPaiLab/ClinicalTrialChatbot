import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Components } from 'streamdown';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import AskAiSelection from '@/components/chat/AskAiSelection/AskAiSelection';
import MessageContextTrials from '@/components/chat/MessageContextTrials/MessageContextTrials';
import MessageFeedback from '@/components/chat/MessageFeedback/MessageFeedback';
import SearchingIndicator from '@/components/chat/SearchingIndicator/SearchingIndicator';
import TermDefinition from '@/components/chat/TermDefinition/TermDefinition';
import TrialCitation from '@/components/chat/TrialCitation/TrialCitation';
import { ChatRole, CITATION_HREF_PREFIX, DEFINITION_HREF_PREFIX } from '@/constants/chat';
import { linkifyCitations, linkifyDefinitions } from '@/lib/citations';
import type { ChatMessage, TrialSummary } from '@/types/trial';

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
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={rootRef} className="contents">
      {onAskAi && <AskAiSelection rootRef={rootRef} onAsk={onAskAi} />}
      <Conversation data-tour="chat-messages" className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <Message from={ChatRole.Assistant}>
              <MessageContent>{t('chat.starter')}</MessageContent>
            </Message>
          ) : (
            messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.role !== ChatRole.Assistant ? (
                    message.content
                  ) : message.error ? (
                    <span className="text-destructive">
                      {t(message.error.key, message.error.params)}
                    </span>
                  ) : message.content === '' ? (
                    <SearchingIndicator />
                  ) : (
                    <MessageResponse
                      components={createMarkdownComponents(fetchTrial, onCitationClick)}
                    >
                      {linkifyDefinitions(linkifyCitations(message.content))}
                    </MessageResponse>
                  )}
                </MessageContent>
                {message.role === ChatRole.User && message.contextNctNumbers && (
                  <MessageContextTrials
                    nctNumbers={message.contextNctNumbers}
                    fetchTrial={fetchTrial}
                    onSelect={onCitationClick}
                  />
                )}
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
